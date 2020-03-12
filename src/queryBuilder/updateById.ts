import Knex from 'knex'

import { BaseBuilder } from './base'
import { BuilderOptions, Models } from './types'

export class UpdateByIdBuilder<TUpdateFields extends Record<string, any>> extends BaseBuilder {
  protected _data: TUpdateFields
  protected _id: number | string

  constructor(options: BuilderOptions, modelName: string, models: Models, id: number | string, data: TUpdateFields) {
    super(options, modelName, models)
    this._id = id
    this._data = data
  }

  /**
   * Executes the query and returns a Promise that will resolve to a boolean that indicates whether the row was updated
   */
  public async execute(): Promise<boolean> {
    const results = await this.toQueryBuilder()
    return results === 1
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

    query.where(`${this._tableName}.${this._primaryKey}`, this._id)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
