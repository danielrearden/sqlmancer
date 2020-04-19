import Knex from 'knex'

import { BaseBuilder } from './base'
import { FindBuilder } from './find'
import { BuilderOptions, Models } from './types'

export class DeleteByIdBuilder<
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any, any>>
> extends BaseBuilder {
  protected _id: number | string

  constructor(options: BuilderOptions, modelName: string, models: Models, id: number | string) {
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
