import _ from 'lodash'
import Knex from 'knex'

import { BaseBuilder } from './base'
import { AggregateBuilder } from './aggregate'
import { FindBuilder } from './find'
import { BuilderOptions, Dialect, Expressions, OrderBy, Models, Where } from './types'
import { getAlias } from './utilities'

export class DeleteManyBuilder<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [FindBuilder<any, any, any, any, any, any, any, any, any>, AggregateBuilder<any, any, any, any, any, any>]
  >
> extends BaseBuilder {
  constructor(options: BuilderOptions, modelName: string, models: Models) {
    super(options, modelName, models)
  }

  /**
   * Sets the WHERE clause for the query.
   */
  public where(where: Where<TDialect, TFields, TIds, TEnums, TAssociations>) {
    this._where = where
    return this
  }

  /**
   * Deep merges the provided object with the existing WHERE options for the query.
   */
  public mergeWhere(where: Where<TDialect, TFields, TIds, TEnums, TAssociations>) {
    this._where = _.merge({}, this._where, where)
    return this
  }

  /**
   * Sets the ORDER BY clause for the query.
   */
  public orderBy(orderBy: OrderBy<TFields, TAssociations>[]) {
    this._orderBy = orderBy
    return this
  }

  /**
   * Sets the LIMIT for the query.
   */
  public limit(value: number) {
    this._limit = value
    return this
  }

  /**
   * Sets the OFFSET for the query.
   */
  public offset(value: number) {
    this._offset = value
    return this
  }

  /**
   * Executes the query and returns a Promise that will resolve to the number of rows that were deleted
   */
  public async execute(): Promise<number> {
    const results = await this.toQueryBuilder()
    return results
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(): Knex.QueryBuilder {
    const query = this._knex(this._tableName).delete()

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    query.whereIn(
      `${this._tableName}.${this._primaryKey}`,
      this._dialect === 'mysql' || this._dialect === 'mariadb'
        ? this._knex
            .queryBuilder()
            .with('conditions', this._getWhereInBuilder())
            .select(`conditions.${this._primaryKey}`)
            .from('conditions')
        : this._getWhereInBuilder()
    )

    return query
  }

  protected _getWhereInBuilder(): Knex.QueryBuilder {
    const expressions: Expressions = {
      select: {},
      join: [],
      where: [],
      groupBy: [],
      orderBy: [],
    }
    const context = { alias: {} }
    const tableAlias = getAlias(this._tableName, context)

    this._addOrderByExpressions(tableAlias, expressions, context)
    this._addWhereExpressions(tableAlias, '', expressions, context)

    const query = this._knex.queryBuilder()

    query.select(`${tableAlias}.${this._primaryKey}`)

    query.from({ [tableAlias]: this._tableName })

    this._applyExpressions(query, expressions)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
