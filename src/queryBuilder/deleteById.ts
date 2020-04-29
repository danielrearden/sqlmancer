import Knex from 'knex'

import { BaseBuilder } from './base'
import { AggregateBuilder } from './aggregate'
import { FindBuilder } from './find'
import { BuilderOptions, ID, Models } from '../types'

export class DeleteByIdBuilder<
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [FindBuilder<any, any, any, any, any, any, any, any, any>, AggregateBuilder<any, any, any, any, any, any>]
  >
> extends BaseBuilder {
  protected _id: ID

  constructor(options: BuilderOptions, modelName: string, models: Models, id: ID) {
    super(options, modelName, models)
    this._id = id
  }

  /**
   * Executes the query and returns a Promise that will resolve to a boolean indicating whether the row was deleted
   */
  public async execute(): Promise<boolean> {
    const results = await this.toQueryBuilder()
    return results >= 1
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(): Knex.QueryBuilder {
    const query = this._knex(this._tableName).delete()

    query.where(`${this._tableName}.${this._primaryKey}`, this._id)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
