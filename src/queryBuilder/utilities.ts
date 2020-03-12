import { QueryBuilderContext } from './types'

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
    ASC_NULLS_LAST: 'asc nulls last',
    DESC: 'desc',
    DESC_NULLS_LAST: 'desc nulls last',
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
