import _ from 'lodash'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import {
  defaultFieldResolver,
  GraphQLCompositeType,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLNamedType,
  GraphQLInt,
  isNamedType,
  GraphQLFieldConfigMap,
} from 'graphql'
import { unwrap, getModelDetails, getDirectiveByName, getScalarTSType, makeNullable } from '../utilities'

export class AggregateDirective extends SchemaDirectiveVisitor<any, any> {
  visitFieldDefinition(
    field: GraphQLField<any, any>,
    details: {
      objectType: GraphQLObjectType | GraphQLInterfaceType
    }
  ): GraphQLField<any, any> {
    const newField = { ...field }
    const { resolve = defaultFieldResolver, type } = field
    const isModelField = !!getDirectiveByName(details.objectType, 'model')

    if (isModelField) {
      newField.resolve = (source, args, ctx, info) => {
        const alias = info.path.key
        const fieldName = info.fieldName
        const modifiedSource = { ...source, [fieldName]: source[alias] }
        return resolve(modifiedSource, args, ctx, info)
      }
    }

    if (this.args.generateType) {
      newField.type = this.getAggregateType(field, type)
    }

    return newField
  }

  private getAggregateType(field: GraphQLField<any, any>, type: GraphQLOutputType): GraphQLOutputType {
    const unwrappedType = unwrap(type)
    const name = `${unwrappedType.name}Aggregate`
    const existingType = this.schema.getType(name)

    if (existingType) {
      return existingType as GraphQLOutputType
    }

    this.assertValidFieldType(field, unwrappedType)

    const { fields } = getModelDetails(unwrappedType as GraphQLCompositeType, this.schema)

    return new GraphQLObjectType({
      name,
      fields: () => {
        const fieldsByAggregateFunction = fields.reduce(
          (acc, field) => {
            const nullableType = makeNullable(field.type)
            if (isNamedType(nullableType)) {
              const tsType = getScalarTSType(this.schema, nullableType.name)
              if (tsType === 'number') {
                acc.avg.push(field)
                acc.sum.push(field)
              }
              if (tsType === 'number' || tsType === 'string' || tsType === 'ID') {
                acc.min.push(field)
                acc.max.push(field)
              }
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
                    type:
                      fn === 'avg' || fn === 'sum'
                        ? new GraphQLNonNull(GraphQLInt)
                        : (unwrap(field.type) as GraphQLOutputType),
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

  private assertValidFieldType(field: GraphQLField<any, any>, type: GraphQLNamedType) {
    const isModelType = !!getDirectiveByName(type, 'model')

    if (!isModelType) {
      throw new Error(
        `Attempted to generate aggregate type for field "${field.name}" but type ${type.name} is not a model.`
      )
    }
  }
}
