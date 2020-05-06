import {
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLInputFieldConfigMap,
  GraphQLList,
  GraphQLNonNull,
  isInputType,
} from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { makeNullable, unwrap } from '../utilities'
import { getSqlmancerConfig } from '../client'
import { SqlmancerConfig } from '../types'

type Action = 'CREATE' | 'UPDATE'

export class InputDirective extends SchemaDirectiveVisitor<any, any> {
  private config: SqlmancerConfig

  constructor(config: any) {
    super(config)
    this.config = getSqlmancerConfig(this.schema)
  }

  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    const modelName = this.args.model || unwrap(field.type).name
    const type = this.getInputType(modelName, this.args.action)!

    return {
      ...field,
      args: [
        ...field.args,
        {
          name: 'input',
          type: this.args.list
            ? new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(type)))
            : new GraphQLNonNull(type),
          description: '',
          defaultValue: undefined,
          extensions: undefined,
          astNode: undefined,
        },
      ],
    }
  }

  private getInputType(modelName: string, action: Action): GraphQLInputObjectType {
    const typeName = this.getInputName(modelName, action)
    let type = this.schema.getTypeMap()[typeName] as GraphQLInputObjectType | undefined

    if (!type) {
      type = this.createInputType(modelName, action)
    }

    return type!
  }

  private getInputName(modelName: string, action: Action): string {
    return `${action === 'CREATE' ? 'Create' : 'Update'}${modelName}Input`
  }

  private createInputType(modelName: string, action: Action): GraphQLInputObjectType {
    const { models } = this.config
    const model = models[modelName]

    if (!model) {
      throw new Error(`"${modelName}" isn't a valid model. Did you include the @model directive?`)
    }

    const typeName = this.getInputName(modelName, action)

    const inputType: GraphQLInputObjectType = new GraphQLInputObjectType({
      name: typeName,
      fields: Object.keys(model.fields).reduce((acc, fieldName) => {
        const field = model.fields[fieldName]
        const nullable = action === 'UPDATE' || field.hasDefault
        if (isInputType(field.type) && (action === 'CREATE' || field.column !== model.primaryKey)) {
          acc[fieldName] = { type: nullable ? makeNullable(field.type) : field.type }
        }
        return acc
      }, {} as GraphQLInputFieldConfigMap),
    })
    this.schema.getTypeMap()[typeName] = inputType

    return inputType
  }
}
