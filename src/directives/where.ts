import _ from 'lodash'
import {
  GraphQLCompositeType,
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
  GraphQLOutputType,
  GraphQLString,
} from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { makeNullable, unwrap, getModelDetails, getSqlmancerConfig, getScalarTSType } from '../utilities'
import { SqlmancerConfig } from '../types'

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
    const modelType = this.getModelType(modelName)
    const typeName = this.getInputName(modelName, withAggregateFields)
    const { fields, joins } = getModelDetails(modelType, this.schema)
    const inputType: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: typeName,
      fields: this.getColumnFields(fields),
    })
    this.schema.getTypeMap()[typeName] = inputType
    Object.assign(inputType.getFields(), {
      ...this.getLogicalOperatorFields(withAggregateFields ? this.getInputType(modelName, false)! : inputType),
      ...this.getAssociationFields(joins),
      ...(withAggregateFields ? this.getAggregateFields(modelName, fields) : {}),
    })

    return inputType
  }

  private getModelType(modelName: string) {
    const modelType = this.schema.getType(modelName)
    if (!modelType) {
      throw new Error(`Model named "${modelName}" doesn't match any type in schema.`)
    }

    const modelDirective = modelType.astNode!.directives!.find(directive => directive.name.value === 'model')
    if (!modelDirective) {
      throw new Error(`Type named "${modelName}" isn't a valid model. Did you include the @model directive?`)
    }

    return modelType as GraphQLCompositeType
  }

  private getColumnFields(fields: { fieldName: string; type: GraphQLOutputType }[]): GraphQLInputFieldConfigMap {
    return fields.reduce((acc, { fieldName, type }) => {
      const operatorType = this.getOperatorType(type)
      if (operatorType) {
        acc[fieldName] = { type: operatorType }
        this.schema.getTypeMap()[operatorType.name] = operatorType
      }
      return acc
    }, {} as GraphQLInputFieldConfigMap)
  }

  private getOperatorType(type: GraphQLOutputType): GraphQLInputObjectType | undefined {
    const nullableType = makeNullable(type)
    const isList = nullableType instanceof GraphQLList
    const unwrappedType = unwrap(type)
    const tsType = getScalarTSType(this.schema, unwrappedType.name)
    const typeName = `${unwrappedType.name}${isList ? 'List' : ''}Operators`

    let operatorType = this.schema.getType(typeName) as GraphQLInputObjectType

    if (!operatorType) {
      let fields = null

      if (isList) {
        if (
          this.config.dialect === 'postgres' &&
          ((tsType && tsType !== 'JSON') || unwrappedType instanceof GraphQLEnumType)
        ) {
          fields = getListOperatorsTypeFields(unwrappedType as GraphQLInputType)
        }
      } else {
        if (unwrappedType instanceof GraphQLEnumType || tsType === 'boolean') {
          fields = {
            ...getEqualOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getInOperatorsTypeFields(unwrappedType as GraphQLInputType),
          }
        } else if (tsType === 'ID' || tsType === 'number') {
          fields = {
            ...getEqualOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getInOperatorsTypeFields(unwrappedType as GraphQLInputType),
            ...getNumericOperatorsTypeFields(unwrappedType as GraphQLInputType),
          }
        } else if (tsType === 'string') {
          fields = {
            ...getEqualOperatorsTypeFields(GraphQLString),
            ...getNumericOperatorsTypeFields(GraphQLString),
            ...getInOperatorsTypeFields(GraphQLString),
            ...getTextOperatorsTypeFields(GraphQLString),
            ...(this.config.dialect === 'postgres' ? getCaseInsensitiveTextOperatorsTypeFields(GraphQLString) : {}),
          }
        } else if (this.config.dialect !== 'sqlite' && tsType === 'JSON') {
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

  private getAssociationFields(
    associationFields: { fieldName: string; type: GraphQLOutputType }[]
  ): GraphQLInputFieldMap {
    return associationFields.reduce((acc, { fieldName, type }) => {
      const nullableType = makeNullable(type)
      const isList = nullableType instanceof GraphQLList
      const unwrappedType = unwrap(type)

      const isModel = !!(
        unwrappedType.astNode && unwrappedType.astNode.directives!.find(directive => directive.name.value === 'model')
      )

      if (isModel) {
        acc[fieldName] = {
          name: fieldName,
          type: this.getInputType(unwrappedType.name, isList)!,
          extensions: undefined,
        }
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

  private getAggregateFields(
    modelName: string,
    fields: { fieldName: string; type: GraphQLOutputType }[]
  ): GraphQLInputFieldMap {
    const fieldsByAggregateFunction = fields.reduce(
      (acc, { fieldName, type }) => {
        const nullableType = makeNullable(type)
        const tsType = getScalarTSType(this.schema, nullableType.name)
        if (tsType === 'number') {
          acc.avg.push(fieldName)
          acc.sum.push(fieldName)
        }
        if (tsType === 'number' || tsType === 'string') {
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
            const field = fields.find(field => field.fieldName === aggregateFieldName)!
            const nullableType = makeNullable(field.type)
            const type =
              aggregateFieldName === 'avg' || aggregateFieldName === 'sum'
                ? this.getOperatorType(GraphQLFloat)!
                : this.getOperatorType(nullableType)!
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
        type: this.getOperatorType(GraphQLInt)!,
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
