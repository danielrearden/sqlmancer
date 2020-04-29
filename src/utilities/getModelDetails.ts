import { isObjectType, DirectiveNode, GraphQLCompositeType, GraphQLOutputType, GraphQLSchema } from 'graphql'
import { parseDirectiveArguments } from './parseDirectiveArguments'

export type ModelDetails = {
  fields: { fieldName: string; columnName?: string; type: GraphQLOutputType; hasDefault: boolean }[]
  associations: { fieldName: string; type: GraphQLOutputType; on: { from: string; to: string }[]; through?: string }[]
  dependencies: { fieldName: string; columns: string[] }[]
  aggregates: Record<string, string>
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
        const columnArgs = parseDirectiveArguments(getDirectiveNode('col', directives), schema)
        const associateArgs = parseDirectiveArguments(getDirectiveNode('associate', directives), schema)
        const dependArgs = parseDirectiveArguments(getDirectiveNode('depend', directives), schema)
        const aggArgs = parseDirectiveArguments(getDirectiveNode('agg', directives), schema)
        const ignoreDirective = getDirectiveNode('ignore', directives)
        const hasDefaultDirective = getDirectiveNode('hasDefault', directives)
        if (!ignoreDirective && !associateArgs && !dependArgs) {
          acc.fields.push({
            fieldName,
            type: field.type,
            columnName: columnArgs ? columnArgs.name : undefined,
            hasDefault: !!hasDefaultDirective,
          })
        } else if (associateArgs) {
          acc.associations.push({ fieldName, type: field.type, on: associateArgs.on, through: associateArgs.through })
        } else if (dependArgs) {
          acc.dependencies.push({ fieldName, columns: dependArgs.on })
        } else if (aggArgs) {
          acc.aggregates[fieldName] = aggArgs.association
        }
      })
      return acc
    },
    { fields: [], associations: [], dependencies: [], aggregates: {} } as ModelDetails
  )
}

function getDirectiveNode(name: string, directives: ReadonlyArray<DirectiveNode>) {
  const directive = directives.find(directive => directive.name.value === name)
  return directive || null
}
