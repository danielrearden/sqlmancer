import _ from 'lodash'
import {
  GraphQLEnumType,
  GraphQLField,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInputFieldConfigMap,
  GraphQLInputFieldMap,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { unwrap, getSqlmancerConfig } from '../utilities'
import { Association, Field, SqlmancerConfig } from '../types'

export class WhereDirective extends SchemaDirectiveVisitor<any, any> {
  private config: SqlmancerConfig

  constructor(config: any) {
    super(config)
    this.config = getSqlmancerConfig(this.schema)
  }

  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    const modelName = this.args.model || unwrap(field.type).name
    const type = this.getInputType(modelName, false)!

    return {
      ...field,
      args: [
        ...field.args,
        {
          name: 'where',
          type,
          description: '',
          defaultValue: undefined,
          extensions: undefined,
          astNode: undefined,
        },
      ],
    }
  }

  private getInputType(modelName: string, withAggregateFields: boolean): GraphQLInputObjectType | undefined {
    const typeName = this.getInputName(modelName, withAggregateFields)
    let type = this.schema.getType(typeName) as GraphQLInputObjectType | undefined

    if (!type) {
      type = this.createInputType(modelName, withAggregateFields)
    }

    return type
  }

  private getInputName(modelName: string, withAggregateFields: boolean): string {
    return `${modelName}Where${withAggregateFields ? 'WithAggregateFields' : ''}`
  }

  private createInputType(modelName: string, withAggregateFields: boolean): GraphQLInputObjectType | undefined {
    const { models } = this.config
    const model = models[modelName]

    if (!model) {
      throw new Error(`"${modelName}" isn't a valid model. Did you include the @model directive?`)
    }

    const typeName = this.getInputName(modelName, withAggregateFields)
    const inputType: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: typeName,
      fields: this.getColumnFields(model.fields),
    })
    this.schema.getTypeMap()[typeName] = inputType
    Object.assign(inputType.getFields(), {
      ...this.getLogicalOperatorFields(withAggregateFields ? this.getInputType(modelName, false)! : inputType),
      ...this.getAssociationFields(model.associations),
      ...(withAggregateFields ? this.getAggregateFields(modelName, model.fields) : {}),
    })

    return inputType
  }

  private getColumnFields(fields: Record<string, Field>): GraphQLInputFieldConfigMap {
    return Object.keys(fields).reduce((acc, fieldName) => {
      const field = fields[fieldName]
      const operatorType = this.getOperatorType(field)
      if (operatorType) {
        acc[fieldName] = { type: operatorType }
        this.schema.getTypeMap()[operatorType.name] = operatorType
      }
      return acc
    }, {} as GraphQLInputFieldConfigMap)
  }

  private getOperatorType({
    mappedType,
    type,
  }: Pick<Field, 'mappedType' | 'type'>): GraphQLInputObjectType | undefined {
    const unwrappedType = unwrap(type)
    const isList = mappedType.substring(mappedType.length - 2) === '[]'
    const typeName = `${unwrappedType.name}${isList ? 'List' : ''}Operators`

    let operatorType = this.schema.getType(typeName) as GraphQLInputObjectType

    if (!operatorType) {
      let fields = null

      if (isList) {
        fields = getListOperatorsTypeFields(unwrappedType as GraphQLInputType)
      } else {
        if (unwrappedType instanceof GraphQLEnumType || mappedType === 'boolean') {
          fields = {
            ...getEqualOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getInOperatorsTypeFields(unwrappedType as GraphQLInputType),
          }
        } else if (mappedType === 'ID' || mappedType === 'number') {
          fields = {
            ...getEqualOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getInOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getNumericOperatorsTypeFields(unwrappedType as GraphQLInputType),
          }
        } else if (mappedType === 'string') {
          fields = {
            ...getEqualOperatorsTypeFields(GraphQLString),
            ...getNumericOperatorsTypeFields(GraphQLString),
            ...getInOperatorsTypeFields(GraphQLString),
            ...getTextOperatorsTypeFields(GraphQLString),
            ...(this.config.dialect === 'postgres' ? getCaseInsensitiveTextOperatorsTypeFields(GraphQLString) : {}),
          }
        } else if (this.config.dialect !== 'sqlite' && mappedType === 'JSON') {
          fields = {
            ...getEqualOperatorsTypeFields(GraphQLString),
            contains: {
              type: GraphQLString,
            },
            containedBy: {
              type: GraphQLString,
            },
            hasKey: {
              type: GraphQLString,
            },
            hasAnyKeys: {
              type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            },
            hasAllKeys: {
              type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
            },
          }
        }
      }

      if (fields) {
        operatorType = new GraphQLInputObjectType({
          name: typeName,
          fields,
        })
        this.schema.getTypeMap()[typeName] = operatorType
      }
    }

    return operatorType
  }

  private getAssociationFields(associations: Record<string, Association>): GraphQLInputFieldMap {
    return Object.keys(associations).reduce((acc, associationName) => {
      const { modelName, isMany } = associations[associationName]

      acc[associationName] = {
        name: associationName,
        type: this.getInputType(modelName, isMany)!,
        extensions: undefined,
      }

      return acc
    }, {} as GraphQLInputFieldMap)
  }

  private getLogicalOperatorFields(inputType: GraphQLInputObjectType): GraphQLInputFieldMap {
    return {
      and: {
        name: 'and',
        type: new GraphQLList(new GraphQLNonNull(inputType)),
        description: undefined,
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
      or: {
        name: 'or',
        type: new GraphQLList(new GraphQLNonNull(inputType)),
        description: undefined,
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
      not: {
        name: 'not',
        type: inputType,
        description: undefined,
        defaultValue: undefined,
        extensions: undefined,
        astNode: undefined,
      },
    }
  }

  private getAggregateFields(modelName: string, fields: Record<string, Field>): GraphQLInputFieldMap {
    const fieldsByAggregateFunction = Object.keys(fields).reduce(
      (acc, fieldName) => {
        const { mappedType } = fields[fieldName]
        if (mappedType === 'number') {
          acc.avg.push(fieldName)
          acc.sum.push(fieldName)
        }
        if (mappedType === 'number' || mappedType === 'string') {
          acc.min.push(fieldName)
          acc.max.push(fieldName)
        }
        return acc
      },
      { avg: [], sum: [], min: [], max: [] } as Record<string, string[]>
    )
    const aggregateFields = Object.keys(fieldsByAggregateFunction).reduce((acc, agggregateFunctionName) => {
      if (fieldsByAggregateFunction[agggregateFunctionName].length) {
        const typeName = `${modelName}Where${_.upperFirst(agggregateFunctionName.substring(1))}`
        const type = new GraphQLInputObjectType({
          name: typeName,
          fields: fieldsByAggregateFunction[agggregateFunctionName].reduce((acc, aggregateFieldName) => {
            const field = fields[aggregateFieldName]
            const type =
              aggregateFieldName === 'avg' || aggregateFieldName === 'sum'
                ? this.getOperatorType({ mappedType: 'number', type: GraphQLFloat })!
                : this.getOperatorType(field)!
            this.schema.getTypeMap()[type.name] = type
            return {
              [aggregateFieldName]: {
                name: aggregateFieldName,
                type,
                extensions: undefined,
              },
              ...acc,
            }
          }, {} as GraphQLInputFieldMap),
        })
        this.schema.getTypeMap()[typeName] = type

        acc[agggregateFunctionName] = {
          name: agggregateFunctionName,
          type,
          extensions: undefined,
        }
      }
      return acc
    }, {} as GraphQLInputFieldMap)

    return {
      ...aggregateFields,
      count: {
        name: 'count',
        type: this.getOperatorType({ mappedType: 'number', type: GraphQLInt })!,
        extensions: undefined,
      },
    }
  }
}

function getEqualOperatorsTypeFields(type: GraphQLInputType) {
  return {
    equal: {
      type,
    },
    notEqual: {
      type,
    },
  }
}

function getInOperatorsTypeFields(type: GraphQLInputType) {
  return {
    in: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    notIn: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
  }
}

function getNumericOperatorsTypeFields(type: GraphQLInputType) {
  return {
    greaterThan: {
      type,
    },
    greaterThanOrEqual: {
      type,
    },
    lessThan: {
      type,
    },
    lessThanOrEqual: {
      type,
    },
  }
}

function getTextOperatorsTypeFields(type: GraphQLInputType) {
  return {
    like: {
      type,
    },
    notLike: {
      type,
    },
  }
}

function getCaseInsensitiveTextOperatorsTypeFields(type: GraphQLInputType) {
  return {
    iLike: {
      type,
    },
    notILike: {
      type,
    },
  }
}

function getListOperatorsTypeFields(type: GraphQLInputType) {
  return {
    equal: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    notEqual: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    contains: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    containedBy: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
    overlaps: {
      type: new GraphQLList(new GraphQLNonNull(type)),
    },
  }
}
