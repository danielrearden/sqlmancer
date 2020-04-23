import _ from 'lodash'
import {
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLInputFieldConfigMap,
  GraphQLInputFieldMap,
  GraphQLList,
  GraphQLNonNull,
  GraphQLOutputType,
} from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { makeNullable, unwrap, getModelDetails, getScalarTSType } from '../utilities'

export class OrderByDirective extends SchemaDirectiveVisitor<any, any> {
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
    const modelType = this.getModelType(modelName)
    const typeName = this.getInputName(modelName, includeAssociations, aggregateFieldsOnly)
    const { fields, joins } = getModelDetails(modelType, this.schema)

    const inputType: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: typeName,
      fields: aggregateFieldsOnly ? this.getAggregateFields(modelName, fields) : this.getColumnFields(fields),
    })
    this.schema.getTypeMap()[typeName] = inputType
    Object.assign(inputType.getFields(), {
      ...(includeAssociations ? this.getAssociationFields(joins) : {}),
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
      if (this.isSortableField(type)) {
        acc[fieldName] = { type: this.getSortDirectionEnum() }
      }
      return acc
    }, {} as GraphQLInputFieldConfigMap)
  }

  private isSortableField(type: GraphQLOutputType): boolean {
    const nullableType = makeNullable(type)
    const tsType = getScalarTSType(this.schema, nullableType.name)

    if (
      tsType === 'number' ||
      tsType === 'string' ||
      tsType === 'ID' ||
      tsType === 'boolean' ||
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
          type: this.getInputType(unwrappedType.name, false, isList)!,
          extensions: undefined,
        }
      }

      return acc
    }, {} as GraphQLInputFieldMap)
  }

  private getAggregateFields(
    modelName: string,
    fields: { fieldName: string; type: GraphQLOutputType }[]
  ): GraphQLInputFieldConfigMap {
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
