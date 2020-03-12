import { SchemaDirectiveVisitor } from 'graphql-tools-fork'
import { GraphQLField, defaultFieldResolver } from 'graphql'

export class JoinDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>): void {
    const { resolve = defaultFieldResolver } = field
    field.resolve = (source, args, ctx, info) => {
      const alias = info.path.key
      const fieldName = info.fieldName
      const modifiedSource = { ...source, [fieldName]: source[alias] }
      return resolve(modifiedSource, args, ctx, info)
    }
  }
}
