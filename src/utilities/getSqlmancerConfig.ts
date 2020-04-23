import _ from 'lodash'
import { GraphQLSchema } from 'graphql'

import { SqlmancerConfig } from '../types'
import { getDirectiveByName } from './getDirectiveByName'
import { parseDirectiveArguments } from './parseDirectiveArguments'

let config: SqlmancerConfig

export function getSqlmancerConfig(schema: GraphQLSchema): SqlmancerConfig {
  if (!config) {
    const sqlmancerDirective = getDirectiveByName(schema.getQueryType(), 'sqlmancer')

    if (!sqlmancerDirective) {
      throw new Error(
        'Unable to parse Sqlmancer configuration from type definitions. Did you include the @sqlmancer directive on your Query type?'
      )
    }

    const args = parseDirectiveArguments(sqlmancerDirective, schema)!
    config = {
      ...args.config,
      dialect: _.lowerCase(args.config.dialect),
    }
  }

  return config
}
