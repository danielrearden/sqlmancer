import Knex from 'knex'
import {
  getAlias,
  getDirection,
  getAggregateFunction,
  getComparisonExpression,
} from '../../../lib/queryBuilder/utilities'

describe('utilities', () => {
  test('getAlias', () => {
    expect(getAlias('penny', { alias: {} })).toStrictEqual('p1')
    expect(getAlias('DOBERMAN', { alias: { d: 1 } })).toStrictEqual('d2')
  })

  test('getDirection', () => {
    expect(getDirection('ASC')).toStrictEqual('asc')
    expect(getDirection('DESC')).toStrictEqual('desc')
    expect(() => getDirection('FOO' as any)).toThrow('Invalid direction value')
  })

  test('getAggregateFunction', () => {
    expect(getAggregateFunction('avg')).toStrictEqual('avg')
    expect(getAggregateFunction('max')).toStrictEqual('max')
    expect(getAggregateFunction('min')).toStrictEqual('min')
    expect(getAggregateFunction('sum')).toStrictEqual('sum')
    expect(() => getAggregateFunction('_foo' as any)).toThrow('Invalid aggregate function name')
  })

  describe('getComparisonExpression', () => {
    test('postgres', () => {
      const knex = Knex({ client: 'pg' })
      const exp = (op: string, value: any) =>
        getComparisonExpression(knex, 'postgres', '"x"."y"', op, value).toSQL().sql

      expect(exp('equal', 10)).toStrictEqual('"x"."y" = ?')
      expect(exp('notEqual', 10)).toStrictEqual('"x"."y" <> ?')
      expect(exp('in', [10])).toStrictEqual('"x"."y" in (?)')
      expect(exp('notIn', [10])).toStrictEqual('"x"."y" not in (?)')
      expect(exp('contains', [10])).toStrictEqual('"x"."y" @> ?')
      expect(exp('containedBy', [10])).toStrictEqual('"x"."y" <@ ?')
      expect(exp('overlaps', [10])).toStrictEqual('"x"."y" && ?')
      expect(exp('greaterThan', 10)).toStrictEqual('"x"."y" > ?')
      expect(exp('greaterThanOrEqual', 10)).toStrictEqual('"x"."y" >= ?')
      expect(exp('lessThan', 10)).toStrictEqual('"x"."y" < ?')
      expect(exp('lessThanOrEqual', 10)).toStrictEqual('"x"."y" <= ?')
      expect(exp('like', 'a')).toStrictEqual('"x"."y" like ?')
      expect(exp('notLike', 'a')).toStrictEqual('"x"."y" not like ?')
      expect(exp('iLike', 'a')).toStrictEqual('"x"."y" ilike ?')
      expect(exp('notILike', 'a')).toStrictEqual('"x"."y" not ilike ?')
      expect(exp('hasKey', 'a')).toStrictEqual('"x"."y" \\? ?')
      expect(exp('hasAnyKeys', ['a'])).toStrictEqual('"x"."y" \\?| ?::text[]')
      expect(exp('hasAllKeys', ['a'])).toStrictEqual('"x"."y" \\?& ?::text[]')
    })

    test('mysql', () => {
      const knex = Knex({ client: 'mysql2' })
      const exp = (op: string, value: any) => getComparisonExpression(knex, 'mysql', '`x`.`y`', op, value).toSQL().sql

      expect(exp('equal', 10)).toStrictEqual('`x`.`y` = ?')
      expect(exp('notEqual', 10)).toStrictEqual('`x`.`y` <> ?')
      expect(exp('in', [10])).toStrictEqual('`x`.`y` in (?)')
      expect(exp('notIn', [10])).toStrictEqual('`x`.`y` not in (?)')
      expect(exp('greaterThan', 10)).toStrictEqual('`x`.`y` > ?')
      expect(exp('greaterThanOrEqual', 10)).toStrictEqual('`x`.`y` >= ?')
      expect(exp('lessThan', 10)).toStrictEqual('`x`.`y` < ?')
      expect(exp('lessThanOrEqual', 10)).toStrictEqual('`x`.`y` <= ?')
      expect(exp('like', 'a')).toStrictEqual('`x`.`y` like ?')
      expect(exp('notLike', 'a')).toStrictEqual('`x`.`y` not like ?')
      expect(exp('contains', [10])).toStrictEqual('json_contains(`x`.`y`, ?)')
      expect(exp('containedBy', [10])).toStrictEqual('json_contains(?, `x`.`y`)')
      expect(exp('hasKey', 'a')).toStrictEqual("json_contains_path(`x`.`y`, 'all', concat('$.', ?))")
      expect(exp('hasAnyKeys', ['a', 'b'])).toStrictEqual(
        "json_contains_path(`x`.`y`, 'one', concat('$.', ?), concat('$.', ?))"
      )
      expect(exp('hasAllKeys', ['a', 'b'])).toStrictEqual(
        "json_contains_path(`x`.`y`, 'all', concat('$.', ?), concat('$.', ?))"
      )
    })

    test('mariadb', () => {
      const knex = Knex({ client: 'mysql2' })
      const exp = (op: string, value: any) => getComparisonExpression(knex, 'mariadb', '`x`.`y`', op, value).toSQL().sql

      expect(exp('equal', 10)).toStrictEqual('`x`.`y` = ?')
      expect(exp('notEqual', 10)).toStrictEqual('`x`.`y` <> ?')
      expect(exp('in', [10])).toStrictEqual('`x`.`y` in (?)')
      expect(exp('notIn', [10])).toStrictEqual('`x`.`y` not in (?)')
      expect(exp('greaterThan', 10)).toStrictEqual('`x`.`y` > ?')
      expect(exp('greaterThanOrEqual', 10)).toStrictEqual('`x`.`y` >= ?')
      expect(exp('lessThan', 10)).toStrictEqual('`x`.`y` < ?')
      expect(exp('lessThanOrEqual', 10)).toStrictEqual('`x`.`y` <= ?')
      expect(exp('like', 'a')).toStrictEqual('`x`.`y` like ?')
      expect(exp('notLike', 'a')).toStrictEqual('`x`.`y` not like ?')
      expect(exp('contains', [10])).toStrictEqual('json_contains(`x`.`y`, ?)')
      expect(exp('containedBy', [10])).toStrictEqual('json_contains(?, `x`.`y`)')
      expect(exp('hasKey', 'a')).toStrictEqual("json_contains_path(`x`.`y`, 'all', concat('$.', ?))")
      expect(exp('hasAnyKeys', ['a', 'b'])).toStrictEqual(
        "json_contains_path(`x`.`y`, 'one', concat('$.', ?), concat('$.', ?))"
      )
      expect(exp('hasAllKeys', ['a', 'b'])).toStrictEqual(
        "json_contains_path(`x`.`y`, 'all', concat('$.', ?), concat('$.', ?))"
      )
    })

    test('sqlite', () => {
      const knex = Knex({ client: 'sqlite3' })
      const exp = (op: string, value: any) => getComparisonExpression(knex, 'sqlite', '`x`.`y`', op, value).toSQL().sql

      expect(exp('equal', 10)).toStrictEqual('`x`.`y` = ?')
      expect(exp('notEqual', 10)).toStrictEqual('`x`.`y` <> ?')
      expect(exp('in', [10])).toStrictEqual('`x`.`y` in (?)')
      expect(exp('notIn', [10])).toStrictEqual('`x`.`y` not in (?)')
      expect(exp('greaterThan', 10)).toStrictEqual('`x`.`y` > ?')
      expect(exp('greaterThanOrEqual', 10)).toStrictEqual('`x`.`y` >= ?')
      expect(exp('lessThan', 10)).toStrictEqual('`x`.`y` < ?')
      expect(exp('lessThanOrEqual', 10)).toStrictEqual('`x`.`y` <= ?')
      expect(exp('like', 'a')).toStrictEqual('`x`.`y` like ?')
      expect(exp('notLike', 'a')).toStrictEqual('`x`.`y` not like ?')
    })

    test('unsupported operator', () => {
      const knex = Knex({ client: 'pg' })
      expect(() => getComparisonExpression(knex, 'postgres', '"x"."y"', 'foo', 10)).toThrow('Unsupported operator')
    })
  })
})
