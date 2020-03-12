import { GraphQLField, GraphQLInt } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools-fork'

export class LimitDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    return {
      ...field,
      args: [
        ...field.args,
        {
          name: 'limit',
          type: GraphQLInt,
          description: '',
          defaultValue: undefined,
          extensions: undefined,
          astNode: undefined,
        },
      ],
    }
  }
}
