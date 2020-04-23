import { GraphQLType, GraphQLNonNull, GraphQLList, GraphQLNamedType } from 'graphql'

export function unwrap(type: GraphQLType) {
  let wrappedType = type

  while (wrappedType instanceof GraphQLList || wrappedType instanceof GraphQLNonNull) {
    wrappedType = wrappedType.ofType
  }

  return wrappedType as GraphQLNamedType
}
