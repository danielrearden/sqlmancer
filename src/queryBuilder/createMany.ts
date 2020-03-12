import Knex from 'knex'
import { BaseBuilder } from './base'
import { BuilderOptions, Models } from './types'

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
    return results
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(): Knex.QueryBuilder {
    const data = this._data.map(object =>
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

    query.returning(this._primaryKey)

    return query
  }
}
