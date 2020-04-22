import _ from 'lodash'
import {
  GraphQLBoolean,
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLField,
  GraphQLFloat,
  GraphQLID,
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
import { GraphQLJSON, GraphQLJSONObject } from '../scalars'
import { SchemaDirectiveVisitor } from 'graphql-tools-fork'
import {
  makeNullable,
  unwrap,
  isCustomScalar,
  isNumberType,
  getModelDetails,
  getSqlmancerConfig,
} from '../graphqlUtilities'
import { SqlmancerConfig } from '../types'

export class WhereDirective extends SchemaDirectiveVisitor {
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
    if (isList) {
      if (this.config.dialect === 'postgres') {
        if (unwrappedType instanceof GraphQLEnumType) {
          return this.getEnumListType(unwrappedType as GraphQLEnumType)
        } else if (unwrappedType === GraphQLID) {
          return IDListOperators
        } else if (unwrappedType === GraphQLString) {
          return StringListOperators
        } else if (unwrappedType === GraphQLInt) {
          return IntListOperators
        } else if (unwrappedType === GraphQLFloat) {
          return FloatListOperators
        } else if (unwrappedType === GraphQLBoolean) {
          return BooleanListOperators
        } else if (isCustomScalar(unwrappedType, GraphQLJSON)) {
          return JSONOperators
        } else if (isCustomScalar(unwrappedType, GraphQLJSONObject)) {
          return JSONOperators
        }
      }
    } else {
      if (unwrappedType instanceof GraphQLEnumType) {
        return this.getEnumType(unwrappedType as GraphQLEnumType)
      } else if (unwrappedType === GraphQLID) {
        return IDOperators
      } else if (unwrappedType === GraphQLString) {
        return this.config.dialect === 'postgres' ? PgStringOperators : StringOperators
      } else if (unwrappedType === GraphQLInt) {
        return IntOperators
      } else if (unwrappedType === GraphQLFloat) {
        return FloatOperators
      } else if (unwrappedType === GraphQLBoolean) {
        return BooleanOperators
      } else if (this.config.dialect !== 'sqlite' && isCustomScalar(unwrappedType, GraphQLJSON)) {
        return JSONOperators
      } else if (this.config.dialect !== 'sqlite' && isCustomScalar(unwrappedType, GraphQLJSONObject)) {
        return JSONOperators
      }
    }
  }

  private getEnumType(enumType: GraphQLEnumType) {
    const typeName = `${enumType.name}Operators`
    let type = this.schema.getType(typeName)
    if (!type) {
      type = new GraphQLInputObjectType({
        name: typeName,
        fields: {
          ...getEqualOperatorsTypeFields(enumType),
          ...getInOperatorsTypeFields(enumType),
          ...getNumericOperatorsTypeFields(enumType),
        },
      })
      this.schema.getTypeMap()[typeName] = type
    }
    return type as GraphQLInputObjectType
  }

  private getEnumListType(enumType: GraphQLEnumType) {
    const typeName = `${enumType.name}ListOperators`
    let type = this.schema.getType(typeName)
    if (!type) {
      type = new GraphQLInputObjectType({
        name: typeName,
        fields: getListOperatorsTypeFields(enumType),
      })
      this.schema.getTypeMap()[typeName] = type
    }
    return type as GraphQLInputObjectType
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
        if (isNumberType(nullableType)) {
          acc.avg.push(fieldName)
          acc.sum.push(fieldName)
        }
        if (isNumberType(nullableType) || nullableType === GraphQLString) {
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
            const type = nullableType === GraphQLFloat ? FloatOperators : IntOperators
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

    this.schema.getTypeMap()[IntOperators.name] = IntOperators

    return {
      ...aggregateFields,
      count: {
        name: 'count',
        type: IntOperators,
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

function getPgTextOperatorsTypeFields(type: GraphQLInputType) {
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

export const IDOperators = new GraphQLInputObjectType({
  name: 'IDOperators',
  fields: {
    ...getEqualOperatorsTypeFields(GraphQLID),
    ...getNumericOperatorsTypeFields(GraphQLID),
    ...getInOperatorsTypeFields(GraphQLID),
  },
})

export const IDListOperators = new GraphQLInputObjectType({
  name: 'IDListOperators',
  fields: getListOperatorsTypeFields(GraphQLID),
})

export const IntOperators = new GraphQLInputObjectType({
  name: 'IntOperators',
  fields: {
    ...getEqualOperatorsTypeFields(GraphQLInt),
    ...getInOperatorsTypeFields(GraphQLInt),
    ...getNumericOperatorsTypeFields(GraphQLInt),
  },
})

export const IntListOperators = new GraphQLInputObjectType({
  name: 'IntListOperators',
  fields: getListOperatorsTypeFields(GraphQLInt),
})

export const FloatOperators = new GraphQLInputObjectType({
  name: 'FloatOperators',
  fields: {
    ...getEqualOperatorsTypeFields(GraphQLFloat),
    ...getInOperatorsTypeFields(GraphQLFloat),
    ...getNumericOperatorsTypeFields(GraphQLFloat),
  },
})

export const FloatListOperators = new GraphQLInputObjectType({
  name: 'FloatListOperators',
  fields: getListOperatorsTypeFields(GraphQLFloat),
})

export const StringOperators = new GraphQLInputObjectType({
  name: 'StringOperators',
  fields: {
    ...getEqualOperatorsTypeFields(GraphQLString),
    ...getNumericOperatorsTypeFields(GraphQLString),
    ...getInOperatorsTypeFields(GraphQLString),
    ...getTextOperatorsTypeFields(GraphQLString),
  },
})

export const PgStringOperators = new GraphQLInputObjectType({
  name: 'PgStringOperators',
  fields: {
    ...getEqualOperatorsTypeFields(GraphQLString),
    ...getNumericOperatorsTypeFields(GraphQLString),
    ...getInOperatorsTypeFields(GraphQLString),
    ...getTextOperatorsTypeFields(GraphQLString),
    ...getPgTextOperatorsTypeFields(GraphQLString),
  },
})

export const StringListOperators = new GraphQLInputObjectType({
  name: 'StringListOperators',
  fields: getListOperatorsTypeFields(GraphQLString),
})

export const BooleanOperators = new GraphQLInputObjectType({
  name: 'BooleanOperators',
  fields: {
    ...getEqualOperatorsTypeFields(GraphQLBoolean),
  },
})

export const BooleanListOperators = new GraphQLInputObjectType({
  name: 'BooleanListOperators',
  fields: getListOperatorsTypeFields(GraphQLBoolean),
})

export const JSONOperators = new GraphQLInputObjectType({
  name: 'JSONOperators',
  fields: {
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
  },
})
