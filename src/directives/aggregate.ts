import _ from 'lodash'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import {
  GraphQLField,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
} from 'graphql'
import { unwrap, getSqlmancerConfig, makeNullable } from '../utilities'
import { SqlmancerConfig } from '../types'

export class AggregateDirective extends SchemaDirectiveVisitor<any, any> {
  private config: SqlmancerConfig

  constructor(config: any) {
    super(config)
    this.config = getSqlmancerConfig(this.schema)
  }

  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    return { ...field, type: this.getAggregateType(field) }
  }

  private getAggregateType(field: GraphQLField<any, any>): GraphQLOutputType {
    const unwrappedType = unwrap(field.type)
    const name = `${unwrappedType.name}Aggregate`
    const existingType = this.schema.getType(name)

    if (existingType) {
      return existingType as GraphQLOutputType
    }
    const { models } = this.config
    const model = models[unwrappedType.name]

    if (!model) {
      throw new Error(
        `Attempted to generate aggregate type for field "${field.name}" but type ${unwrappedType.name} is not a model.`
      )
    }

    return new GraphQLObjectType({
      name,
      fields: () => {
        const fieldsByAggregateFunction = Object.keys(model.fields).reduce(
          (acc, fieldName) => {
            const { mappedType, type } = model.fields[fieldName]
            if (mappedType === 'number') {
              acc.avg.push({ fieldName, type: new GraphQLNonNull(GraphQLFloat) })
              acc.sum.push({ fieldName, type: new GraphQLNonNull(GraphQLFloat) })
            }
            if (mappedType === 'number' || mappedType === 'string' || mappedType === 'ID' || mappedType === 'Date') {
              const nullableType = makeNullable(type)
              acc.min.push({ fieldName, type: nullableType })
              acc.max.push({ fieldName, type: nullableType })
            }

            return acc
          },
          { avg: [], sum: [], min: [], max: [] } as Record<string, { fieldName: string; type: GraphQLOutputType }[]>
        )

        const aggregateFields = {
          count: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        } as GraphQLFieldConfigMap<any, any>

        Object.keys(fieldsByAggregateFunction).forEach(fn => {
          if (fieldsByAggregateFunction[fn].length) {
            aggregateFields[fn] = {
              type: new GraphQLObjectType({
                name: `${name}${_.upperFirst(fn)}`,
                fields: fieldsByAggregateFunction[fn].reduce((acc, field) => {
                  acc[field.fieldName] = {
                    type: field.type,
                  }
                  return acc
                }, {} as GraphQLFieldConfigMap<any, any>),
              }),
            }
          }
        })

        return aggregateFields
      },
    })
  }
}
