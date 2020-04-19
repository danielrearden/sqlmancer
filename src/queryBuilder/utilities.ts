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

export function getComparisonOperator(key: string): string {
  const operatorMap: Record<string, string> = {
    equal: '=',
    notEqual: '<>',
    in: 'IN',
    notIn: 'NOT IN',
    contains: '@>',
    containedBy: '<@',
    overlaps: '&&',
    greaterThan: '>',
    greaterThanOrEqual: '>=',
    lessThan: '<',
    lessThanOrEqual: '<=',
    like: 'LIKE',
    notLike: 'NOT LIKE',
    iLike: 'ILIKE',
    notILike: 'NOT ILIKE',
    hasKey: '?',
    hasAnyKeys: '?|',
    hasAllKeys: '?&',
  }
  const operator = operatorMap[key]

  if (!operator) {
    throw new Error(`Invalid operator "${key}"`)
  }

  return operator
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
