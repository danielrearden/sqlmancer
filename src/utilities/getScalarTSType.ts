import _ from 'lodash'
import { GraphQLSchema } from 'graphql'
import { getSqlmancerConfig } from './getSqlmancerConfig'

type PossibleScalarTSTypes = 'string' | 'number' | 'boolean' | 'JSON' | 'ID'

let scalarMap: Record<string, PossibleScalarTSTypes>

export function getScalarTSType(schema: GraphQLSchema, name: string) {
  return getScalarMap(schema)[name]
}

function getScalarMap(schema: GraphQLSchema) {
  if (!scalarMap) {
    const config = getSqlmancerConfig(schema)
    const baseScalars = {
      string: ['String'],
      number: ['Int', 'Float'],
      boolean: ['Boolean'],
      JSON: [],
      ID: ['ID'],
    }
    const scalarsByTSType = _.mergeWith({}, baseScalars, config.customScalars, (obj, src) => {
      if (Array.isArray(obj)) {
        return obj.concat(src)
      }
    }) as Record<string, string[]>
    scalarMap = Object.keys(scalarsByTSType).reduce((acc, tsType) => {
      if (tsType === 'string' || tsType === 'number' || tsType === 'boolean' || tsType === 'JSON' || tsType === 'ID') {
        scalarsByTSType[tsType].forEach(scalarName => {
          acc[scalarName] = tsType
        })
      }
      return acc
    }, {} as Record<string, PossibleScalarTSTypes>)
  }
  return scalarMap
}
