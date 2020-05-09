import Knex from 'knex'
import { BaseBuilder } from './base'
import { BuilderOptions, Models } from '../types'

export class CreateManyBuilder<TCreateFields extends Record<string, any>> extends BaseBuilder {
  protected _data: TCreateFields[]

  constructor(options: BuilderOptions, modelName: string, models: Models, data: TCreateFields[]) {
    super(options, modelName, models)
    this._data = data
  }

  /**
   * Executes the query and returns a Promise that will resolve to an array of IDs of the created rows.
   */
  public async execute(): Promise<(string | number)[]> {
    const results = await this.toQueryBuilder()

    if (this._dialect === 'postgres') {
      return results
    }

    const id = results[0]

    if (this._dialect === 'sqlite') {
      return this._data.map((_record, index) => id - (this._data.length - 1) + index).filter((x) => !isNaN(x))
    }

    return this._data.map((_record, index) => id + index).filter((x) => !isNaN(x))
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(): Knex.QueryBuilder {
    const data = this._data.map((object) =>
      Object.keys(object).reduce((acc, key) => {
        const field = this._model.fields[key]
        if (field) {
          acc[field.column] = object[key]
        }
        return acc
      }, {} as Record<string, any>)
    )

    const query = this._knex(this._tableName).insert(data)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    if (this._dialect === 'postgres') {
      query.returning(this._primaryKey)
    }

    return query
  }
}
