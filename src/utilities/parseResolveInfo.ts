import { GraphQLResolveInfo } from 'graphql'
import { parse, FieldsByTypeName, ResolveTree } from 'graphql-parse-resolve-info'

export interface FlattenedResolveTree {
  name: string
  alias: string
  args: Record<string, any>
  fields: Record<string, FlattenedResolveTree>
}

export function parseResolveInfo(info: GraphQLResolveInfo): FlattenedResolveTree | null {
  const parsedInfo = parse(info)
  if (!parsedInfo) {
    return null
  }

  const { name, alias, args, fieldsByTypeName } = parsedInfo as ResolveTree
  return {
    name,
    alias,
    args,
    fields: flattenFieldsByType(fieldsByTypeName),
  }
}

function flattenFieldsByType(fieldsByType: FieldsByTypeName) {
  return Object.keys(fieldsByType).reduce((acc, typeName) => {
    Object.keys(fieldsByType[typeName]).forEach(fieldName => {
      const { name, alias, args, fieldsByTypeName } = fieldsByType[typeName][fieldName]
      acc[fieldName] = { name, alias, args, fields: flattenFieldsByType(fieldsByTypeName) }
    })
    return acc
  }, {} as Record<string, FlattenedResolveTree>)
}
