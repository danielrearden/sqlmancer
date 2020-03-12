import { getAlias, getDirection, getAggregateFunction, getComparisonOperator } from '../utilities'

describe('utilities', () => {
  test('getAlias', () => {
    expect(getAlias('penny', { alias: {} })).toStrictEqual('p1')
    expect(getAlias('DOBERMAN', { alias: { d: 1 } })).toStrictEqual('d2')
  })

  test('getDirection', () => {
    expect(getDirection('ASC')).toStrictEqual('asc')
    expect(getDirection('ASC_NULLS_LAST')).toStrictEqual('asc nulls last')
    expect(getDirection('DESC')).toStrictEqual('desc')
    expect(getDirection('DESC_NULLS_LAST')).toStrictEqual('desc nulls last')
    expect(() => getDirection('FOO' as any)).toThrow('Invalid direction value')
  })

  test('getAggregateFunction', () => {
    expect(getAggregateFunction('avg')).toStrictEqual('avg')
    expect(getAggregateFunction('max')).toStrictEqual('max')
    expect(getAggregateFunction('min')).toStrictEqual('min')
    expect(getAggregateFunction('sum')).toStrictEqual('sum')
    expect(() => getAggregateFunction('_foo' as any)).toThrow('Invalid aggregate function name')
  })

  test('getComparisonOperator', () => {
    expect(getComparisonOperator('equal')).toStrictEqual('=')
    expect(getComparisonOperator('notEqual')).toStrictEqual('<>')
    expect(getComparisonOperator('in')).toStrictEqual('IN')
    expect(getComparisonOperator('notIn')).toStrictEqual('NOT IN')
    expect(getComparisonOperator('contains')).toStrictEqual('@>')
    expect(getComparisonOperator('containedBy')).toStrictEqual('<@')
    expect(getComparisonOperator('overlaps')).toStrictEqual('&&')
    expect(getComparisonOperator('greaterThan')).toStrictEqual('>')
    expect(getComparisonOperator('greaterThanOrEqual')).toStrictEqual('>=')
    expect(getComparisonOperator('lessThan')).toStrictEqual('<')
    expect(getComparisonOperator('lessThanOrEqual')).toStrictEqual('<=')
    expect(getComparisonOperator('like')).toStrictEqual('LIKE')
    expect(getComparisonOperator('notLike')).toStrictEqual('NOT LIKE')
    expect(getComparisonOperator('iLike')).toStrictEqual('ILIKE')
    expect(getComparisonOperator('notILike')).toStrictEqual('NOT ILIKE')
    expect(getComparisonOperator('hasKey')).toStrictEqual('?')
    expect(getComparisonOperator('hasAnyKeys')).toStrictEqual('?|')
    expect(getComparisonOperator('hasAllKeys')).toStrictEqual('?&')
    expect(() => getComparisonOperator('_foo' as any)).toThrow('Invalid operator')
  })
})
