import { DirectiveNode, GraphQLSchema } from 'graphql'
import { getArgumentValues } from 'graphql/execution/values'

export function parseDirectiveArguments(
  directive: DirectiveNode | null,
  schema: GraphQLSchema
): Record<string, any> | null {
  if (!directive) {
    return null
  }
  return getArgumentValues(schema.getDirective(directive.name.value)!, directive)
}
