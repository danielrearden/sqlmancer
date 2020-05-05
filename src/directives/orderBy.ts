import _ from 'lodash'
import {
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLInputFieldConfigMap,
  GraphQLInputFieldMap,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { makeNullable, unwrap } from '../utilities'
import { getSqlmancerConfig } from '../client'
import { Association, Field, SqlmancerConfig } from '../types'

export class OrderByDirective extends SchemaDirectiveVisitor<any, any> {
  private config: SqlmancerConfig

  constructor(config: any) {
    super(config)
    this.config = getSqlmancerConfig(this.schema)
  }

  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    const modelName = this.args.model || unwrap(field.type).name
    const type = this.getInputType(modelName, true, false)!

    return {
      ...field,
      args: [
        ...field.args,
        {
          name: 'orderBy',
          type: new GraphQLList(new GraphQLNonNull(type)),
          description: '',
          defaultValue: undefined,
          extensions: undefined,
          astNode: undefined,
        },
      ],
    }
  }

  private getInputType(
    modelName: string,
    includeAssociations: boolean,
    aggregateFieldsOnly: boolean
  ): GraphQLInputObjectType | undefined {
    const typeName = this.getInputName(modelName, includeAssociations, aggregateFieldsOnly)
    let type = this.schema.getTypeMap()[typeName] as GraphQLInputObjectType | undefined

    if (!type) {
      type = this.createInputType(modelName, includeAssociations, aggregateFieldsOnly)
    }

    return type
  }

  private getInputName(modelName: string, includeAssociations: boolean, aggregateFieldsOnly: boolean): string {
    return aggregateFieldsOnly
      ? `${modelName}OrderByAggregateFieldsOnly`
      : includeAssociations
      ? `${modelName}OrderBy`
      : `${modelName}OrderByNested`
  }

  private createInputType(
    modelName: string,
    includeAssociations: boolean,
    aggregateFieldsOnly: boolean
  ): GraphQLInputObjectType | undefined {
    const { models } = this.config
    const model = models[modelName]

    if (!model) {
      throw new Error(`"${modelName}" isn't a valid model. Did you include the @model directive?`)
    }

    const typeName = this.getInputName(modelName, includeAssociations, aggregateFieldsOnly)

    const inputType: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: typeName,
      fields: aggregateFieldsOnly
        ? this.getAggregateFields(modelName, model.fields)
        : this.getColumnFields(model.fields),
    })
    this.schema.getTypeMap()[typeName] = inputType
    Object.assign(inputType.getFields(), {
      ...(includeAssociations ? this.getAssociationFields(model.associations) : {}),
    })

    return inputType
  }

  private getColumnFields(fields: Record<string, Field>): GraphQLInputFieldConfigMap {
    return Object.keys(fields).reduce((acc, fieldName) => {
      const field = fields[fieldName]
      if (this.isSortableField(field)) {
        acc[fieldName] = { type: this.getSortDirectionEnum() }
      }
      return acc
    }, {} as GraphQLInputFieldConfigMap)
  }

  private isSortableField({ mappedType, type }: Field): boolean {
    const nullableType = makeNullable(type)
    if (
      mappedType === 'number' ||
      mappedType === 'string' ||
      mappedType === 'ID' ||
      mappedType === 'boolean' ||
      mappedType === 'Date' ||
      nullableType instanceof GraphQLEnumType
    ) {
      return true
    }
    return false
  }

  private getSortDirectionEnum() {
    let type = this.schema.getType('SortDirection')

    if (!type) {
      type = new GraphQLEnumType({
        name: 'SortDirection',
        values: {
          ASC: {},
          DESC: {},
        },
      })

      this.schema.getTypeMap().SortDirection = type
    }

    return type as GraphQLEnumType
  }

  private getAssociationFields(associations: Record<string, Association>): GraphQLInputFieldMap {
    return Object.keys(associations).reduce((acc, associationName) => {
      const { modelName, isMany } = associations[associationName]

      acc[associationName] = {
        name: associationName,
        type: this.getInputType(modelName, false, isMany)!,
        extensions: undefined,
      }

      return acc
    }, {} as GraphQLInputFieldMap)
  }

  private getAggregateFields(modelName: string, fields: Record<string, Field>): GraphQLInputFieldConfigMap {
    const fieldsByAggregateFunction = Object.keys(fields).reduce(
      (acc, fieldName) => {
        const { mappedType } = fields[fieldName]
        if (mappedType === 'number') {
          acc.avg.push(fieldName)
          acc.sum.push(fieldName)
        }
        if (mappedType === 'number' || mappedType === 'string' || mappedType === 'Date') {
          acc.min.push(fieldName)
          acc.max.push(fieldName)
        }
        return acc
      },
      { avg: [], sum: [], min: [], max: [] } as Record<string, string[]>
    )
    const aggregateFields = Object.keys(fieldsByAggregateFunction).reduce((acc, aggregateFunctionName) => {
      if (fieldsByAggregateFunction[aggregateFunctionName].length) {
        const typeName = `${modelName}Where${_.upperFirst(aggregateFunctionName.substring(1))}`
        const type = new GraphQLInputObjectType({
          name: typeName,
          fields: fieldsByAggregateFunction[aggregateFunctionName].reduce((acc, fieldName) => {
            return {
              [fieldName]: {
                type: this.getSortDirectionEnum(),
              },
              ...acc,
            }
          }, {} as GraphQLInputFieldConfigMap),
        })
        this.schema.getTypeMap()[typeName] = type

        acc[aggregateFunctionName] = {
          type,
        }
      }
      return acc
    }, {} as GraphQLInputFieldConfigMap)

    return {
      ...aggregateFields,
      count: {
        type: this.getSortDirectionEnum(),
      },
    }
  }
}
