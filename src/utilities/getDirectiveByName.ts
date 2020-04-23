import { GraphQLNamedType } from 'graphql'

export function getDirectiveByName(type: GraphQLNamedType | null | undefined, name: string) {
  return type && type.astNode && type.astNode.directives!.find(directive => directive.name.value === name)
}
