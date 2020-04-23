import { GraphQLType, GraphQLNonNull } from 'graphql'

export function makeNullable(type: GraphQLType) {
  if (type instanceof GraphQLNonNull) {
    return type.ofType
  }
  return type as any
}
