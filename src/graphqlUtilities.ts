import _ from 'lodash'
import {
  isObjectType,
  DirectiveNode,
  GraphQLCompositeType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLNamedType,
  GraphQLScalarType,
  GraphQLResolveInfo,
  GraphQLSchema,
} from 'graphql'
import { parse, FieldsByTypeName, ResolveTree } from 'graphql-parse-resolve-info'
import { ModelDetails } from './types'
import { getArgumentValues } from 'graphql/execution/values'

export interface FlattenedResolveTree {
  name: string
  alias: string
  args: Record<string, any>
  fields: Record<string, FlattenedResolveTree>
}

export function unwrap(type: GraphQLType) {
  let wrappedType = type

  while (wrappedType instanceof GraphQLList || wrappedType instanceof GraphQLNonNull) {
    wrappedType = wrappedType.ofType
  }

  return wrappedType as GraphQLNamedType
}

export function makeNullable(type: GraphQLType) {
  if (type instanceof GraphQLNonNull) {
    return type.ofType
  }
  return type as any
}

export function isCustomScalar(type: GraphQLType, scalar: GraphQLScalarType) {
  return _.isMatch(type, _.pick(scalar, ['parseLiteral', 'parseValue', 'serialize']))
}

export function isNumberType(type: GraphQLType): boolean {
  return type === GraphQLInt || type === GraphQLFloat
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

export function getDirectiveByName(type: GraphQLNamedType | null | undefined, name: string) {
  return type && type.astNode && type.astNode.directives!.find(directive => directive.name.value === name)
}

export function getModelDetails(type: GraphQLCompositeType, schema: GraphQLSchema) {
  const implementingTypes = isObjectType(type) ? [type] : schema.getPossibleTypes(type)
  return implementingTypes.reduce(
    (acc, implementingType) => {
      const fieldMap = implementingType.getFields()
      const fieldNames = Object.keys(fieldMap)
      fieldNames.forEach(fieldName => {
        const field = fieldMap[fieldName]
        const directives = field.astNode!.directives!
        const columnArgs = getDirectiveArguments(getDirectiveNode('col', directives), schema)
        const joinArgs = getDirectiveArguments(getDirectiveNode('join', directives), schema)
        const dependArgs = getDirectiveArguments(getDirectiveNode('depend', directives), schema)
        const ignoreDirective = getDirectiveNode('ignore', directives)
        const hasDefaultDirective = getDirectiveNode('hasDefault', directives)
        if (!ignoreDirective && !joinArgs && !dependArgs) {
          acc.fields.push({
            fieldName,
            type: field.type,
            columnName: columnArgs ? columnArgs.name : undefined,
            hasDefault: !!hasDefaultDirective,
          })
        } else if (joinArgs) {
          acc.joins.push({ fieldName, type: field.type, on: joinArgs.on, through: joinArgs.through })
        } else if (dependArgs) {
          acc.dependencies.push({ fieldName, columns: dependArgs.on })
        }
      })
      return acc
    },
    { fields: [], joins: [], dependencies: [] } as ModelDetails
  )
}

export function getDirectiveNode(name: string, directives: ReadonlyArray<DirectiveNode>) {
  const directive = directives.find(directive => directive.name.value === name)
  return directive || null
}

export function getDirectiveArguments(
  directive: DirectiveNode | null,
  schema: GraphQLSchema
): Record<string, any> | null {
  if (!directive) {
    return null
  }
  return getArgumentValues(schema.getDirective(directive.name.value)!, directive)
}
