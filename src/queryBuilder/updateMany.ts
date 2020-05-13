import _ from 'lodash'
import Knex from 'knex'

import { BaseBuilder } from './base'
import { PaginateBuilder } from './paginate'
import { FindBuilder } from './find'
import { BuilderOptions, Dialect, Expressions, OrderBy, Models, Where } from '../types'
import { getAlias } from './utilities'

export class UpdateManyBuilder<
  TDialect extends Dialect,
  TUpdateFields extends Record<string, any>,
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >
> extends BaseBuilder {
  protected _data: TUpdateFields

  constructor(options: BuilderOptions, modelName: string, models: Models, data: TUpdateFields) {
    super(options, modelName, models)
    this._data = data
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
   * Executes the query and returns a Promise that will resolve to the number of rows that were updated
   */
  public async execute(): Promise<number> {
    const results = await this.toQueryBuilder()
    return results
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(): Knex.QueryBuilder {
    const data = Object.keys(this._data).reduce((acc, key) => {
      const field = this._model.fields[key]
      if (field) {
        acc[field.column] = this._data[key]
      }
      return acc
    }, {} as Record<string, any>)

    const query = this._knex(this._tableName).update(data)

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
    const tableAlias = getAlias(this._tableName!, context)

    this._addOrderByExpressions(tableAlias, expressions, context)
    this._addWhereExpressions(tableAlias, '', expressions, context)

    const query = this._knex.queryBuilder()

    query.select(`${tableAlias}.${this._primaryKey}`)

    query.from({ [tableAlias]: this._tableName! })

    this._applyExpressions(query, expressions)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
