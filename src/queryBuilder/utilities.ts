import Knex from 'knex'
import { QueryBuilderContext, Dialect } from './types'

export function getAlias(name: string, context: QueryBuilderContext): string {
  const index = name.substring(0, 1).toLowerCase()
  if (!context.alias[index]) {
    context.alias[index] = 1
  } else {
    context.alias[index] = context.alias[index]! + 1
  }
  return `${index}${context.alias[index]}`
}

export function getDirection(enumValue: string): string {
  const enumValues: Record<string, string> = {
    ASC: 'asc',
    DESC: 'desc',
  }

  if (!enumValues[enumValue]) {
    throw new Error(`Invalid direction value: ${JSON.stringify(enumValue)}`)
  }

  return enumValues[enumValue]
}

export function getAggregateFunction(key: string): string {
  const aggregates: Record<string, string> = {
    avg: 'avg',
    max: 'max',
    min: 'min',
    sum: 'sum',
  }

  if (!aggregates[key]) {
    throw new Error(`Invalid aggregate function name: ${JSON.stringify(key)}`)
  }

  return aggregates[key]
}

export function getComparisonExpression(
  knex: Knex,
  dialect: Dialect,
  column: string | Knex.Ref<any, any>,
  operator: string,
  value: any
): Knex.Raw {
  if (value === null && (operator === 'equal' || operator === 'notEqual')) {
    return knex.raw(`${column} is ${operator === 'notEqual' ? 'not ' : ''}null`)
  }

  switch (operator) {
    case 'equal':
      return knex.raw(`${column} = ?`, [value])
    case 'notEqual':
      return knex.raw(`${column} <> ?`, [value])
    case 'in':
      return knex.raw(`${column} in ?`, [value])
    case 'notIn':
      return knex.raw(`${column} not in ?`, [value])
    case 'greaterThan':
      return knex.raw(`${column} > ?`, [value])
    case 'greaterThanOrEqual':
      return knex.raw(`${column} >= ?`, [value])
    case 'lessThan':
      return knex.raw(`${column} < ?`, [value])
    case 'lessThanOrEqual':
      return knex.raw(`${column} <= ?`, [value])
    case 'like':
      return knex.raw(`${column} like ?`, [value])
    case 'notLike':
      return knex.raw(`${column} not like ?`, [value])
  }

  if (dialect === 'postgres') {
    switch (operator) {
      case 'contains':
        return knex.raw(`${column} @> ?`, [value])
      case 'containedBy':
        return knex.raw(`${column} <@ ?`, [value])
      case 'overlaps':
        return knex.raw(`${column} && ?`, [value])
      case 'iLike':
        return knex.raw(`${column} ilike ?`, [value])
      case 'notILike':
        return knex.raw(`${column} not ilike ?`, [value])
      case 'hasKey':
        return knex.raw(`${column} \\? ?`, [value])
      case 'hasAnyKeys':
        return knex.raw(`${column} \\?| ?::text[]`, [value])
      case 'hasAllKeys':
        return knex.raw(`${column} \\?& ?::text[]`, [value])
    }
  }

  if (dialect === 'mysql' || dialect === 'mariadb') {
    switch (operator) {
      case 'contains':
        return knex.raw(`json_contains(${column}, ?)`, [value])
      case 'containedBy':
        return knex.raw(`json_contains(?, ${column})`, [value])
      case 'hasKey':
        return knex.raw(`json_contains_path(${column}, 'all', concat('$.', ?))`, [value])
      case 'hasAnyKeys':
        return knex.raw(`json_contains_path(${column}, 'one', ${value.map(() => `concat('$.', ?)`).join(', ')})`, value)
      case 'hasAllKeys':
        return knex.raw(`json_contains_path(${column}, 'all', ${value.map(() => `concat('$.', ?)`).join(', ')})`, value)
    }
  }

  throw new Error(`Unsupported operator "${operator}" for dialect ${dialect}`)
}

export function getJsonObjectFunctionByDialect(dialect: Dialect) {
  switch (dialect) {
    case 'postgres':
      return 'json_build_object'
    case 'mysql':
      return 'json_object'
    case 'mariadb':
      return 'json_object'
    case 'sqlite':
      return 'json_object'
  }
}

export function getJsonAggregateExpressionByDialect(dialect: Dialect, isArray: boolean): [string, number] {
  switch (dialect) {
    case 'postgres':
      return [isArray ? `coalesce(nullif(json_agg(??)::text, '[null]'), '[]')::json` : `json_agg(??) -> 0`, 1]
    case 'mysql':
      return isArray
        ? [`if(json_arrayagg(??) is null, json_array(), json_arrayagg(??))`, 2]
        : [`json_extract(json_arrayagg(??), '$[0]')`, 1]
    case 'mariadb':
      return isArray
        ? [`if(json_arrayagg(??) is null, json_array(), json_arrayagg(??))`, 2]
        : [`json_extract(json_arrayagg(??), '$[0]')`, 1]
    case 'sqlite':
      return [isArray ? `json_group_array(??)` : `json_extract(json_group_array(??), '$[0]')`, 1]
  }
}
