import _ from 'lodash'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import {
  GraphQLBoolean,
  GraphQLField,
  GraphQLFieldConfigMap,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
} from 'graphql'
import { makeNullable, unwrap } from '../utilities'
import { getSqlmancerConfig } from '../client'
import { Model, SqlmancerConfig } from '../types'

export class PaginateDirective extends SchemaDirectiveVisitor<any, any> {
  private config: SqlmancerConfig

  constructor(config: any) {
    super(config)
    this.config = getSqlmancerConfig(this.schema)
  }

  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    return { ...field, type: this.getPaginateType(field) }
  }

  private getPaginateType(field: GraphQLField<any, any>): GraphQLOutputType {
    const unwrappedType = unwrap(field.type)
    const name = `${unwrappedType.name}Page`
    const existingType = this.schema.getType(name)
    const { models } = this.config
    const model = models[unwrappedType.name]

    if (existingType) {
      return existingType as GraphQLOutputType
    }

    if (!model) {
      throw new Error(
        `Attempted to generate page type for field "${field.name}" but type ${unwrappedType.name} is not a model.`
      )
    }

    return new GraphQLObjectType({
      name,
      fields: () => ({
        results: {
          type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(unwrappedType))),
        },
        aggregate: {
          type: new GraphQLNonNull(this.getAggregateType(`${unwrappedType.name}Aggregate`, model)),
        },
        hasMore: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
      }),
    })
  }

  private getAggregateType(name: string, model: Model): GraphQLOutputType {
    const existingType = this.schema.getType(name)

    if (existingType) {
      return existingType as GraphQLOutputType
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

        Object.keys(fieldsByAggregateFunction).forEach((fn) => {
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
