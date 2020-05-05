import _ from 'lodash'
import Knex from 'knex'

import { BuilderOptions, Expressions, ID, QueryBuilderContext, Models, LoadedFromBuilder } from '../types'
import { BaseBuilder } from './base'
import { AggregateBuilder } from './aggregate'
import { FindBuilder } from './find'
import { getAlias } from './utilities'
import { GraphQLResolveInfo } from 'graphql'
import { parseResolveInfo } from '../utilities'

export abstract class FindByIdBuilder<
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [FindBuilder<any, any, any, any, any, any, any, any, any>, AggregateBuilder<any, any, any, any, any, any>]
  >,
  TSelected extends Pick<TFields, any> = TFields,
  TRawSelected extends Record<string, any> = {},
  TLoaded extends Record<string, any> = {}
> extends BaseBuilder {
  protected _id: ID

  constructor(options: BuilderOptions, modelName: string, models: Models, id: ID) {
    super(options, modelName, models)
    this._id = id
    this._select = Object.keys(this._model.fields)
  }

  /**
   * Sets the SELECT clause for the query.
   */
  public select<T extends keyof TFields>(
    ...fields: T[]
  ): FindByIdBuilder<TFields, TIds, TEnums, TAssociations, Pick<TFields, T>, TRawSelected, TLoaded> {
    this._select = fields
    return this
  }

  /**
   * Sets the SELECT clause for the query to all available fields.
   */
  public selectAll(): FindByIdBuilder<TFields, TIds, TEnums, TAssociations, TFields, TRawSelected, TLoaded> {
    this._select = Object.keys(this._model.fields)
    return this
  }

  /**
   * Adds on to the SELECT clause for the query.
   */
  public addSelect<T extends keyof TFields>(
    ...fields: T[]
  ): FindByIdBuilder<TFields, TIds, TEnums, TAssociations, TSelected & Pick<TFields, T>, TRawSelected, TLoaded> {
    this._select = [...this._select, ...fields]
    return this
  }

  /**
   * Adds an additional column to the SELECT clause under the provided alias.
   */
  public addSelectRaw<TColumn extends string, TAlias extends string = TColumn>(
    column: TColumn,
    as?: TAlias
  ): FindByIdBuilder<
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected & { [key in TAlias]: any },
    TLoaded
  > {
    this._rawSelect[as || column] = column
    return this
  }

  /**
   * Eager loads the specified association.
   */
  public load<
    TName extends Extract<keyof TAssociations, string>,
    TGetBuilder extends (
      builder: TAssociations[TName][0]
    ) => FindBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][0]
    ) => TAssociations[TName][0]
  >(
    name: TName,
    getBuilder?: TGetBuilder
  ): FindByIdBuilder<
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TName]: LoadedFromBuilder<ReturnType<TGetBuilder>>
      }
  >

  public load<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (
      builder: TAssociations[TName][0]
    ) => FindBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][0]
    ) => TAssociations[TName][0]
  >(
    name: TName,
    as: TAlias,
    getBuilder?: TGetBuilder
  ): FindByIdBuilder<
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TAlias]: LoadedFromBuilder<ReturnType<TGetBuilder>>
      }
  >
  public load<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (
      builder: TAssociations[TName][0]
    ) => FindBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][0]
    ) => TAssociations[TName][0]
  >(name: TName, aliasOrGetBuilder?: TAlias | TGetBuilder, getBuilder?: TGetBuilder) {
    const association = this._model.associations[name]

    if (!association) {
      throw new Error(`Invalid association name: ${name}`)
    }

    const fieldName = typeof aliasOrGetBuilder === 'string' ? aliasOrGetBuilder : name
    const getBuilderFn = typeof aliasOrGetBuilder === 'string' ? getBuilder : aliasOrGetBuilder
    const builders = this._models[association.modelName].builders
    const Builder = association.isMany ? builders.findMany : builders.findOne
    const initialBuilder = new Builder(this._options)
    this._loadedAssociations[fieldName] = [
      name,
      getBuilderFn ? getBuilderFn(initialBuilder as TAssociations[TName][0]) : initialBuilder,
    ]

    return this
  }

  public loadAggregate<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (builder: TAssociations[TName][1]) => AggregateBuilder<any, any, any, any, any, any> = (
      builder: TAssociations[TName][1]
    ) => TAssociations[TName][1]
  >(
    associationName: TName,
    alias: TAlias,
    getBuilder?: TGetBuilder
  ): FindByIdBuilder<
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TAlias]: string | number
      }
  > {
    const association = this._model.associations[associationName]

    if (!association) {
      throw new Error(`Invalid association name: ${associationName}`)
    }

    const Builder = this._models[association.modelName].builders.aggregate
    const initialBuilder = new Builder(this._options)
    this._loadedAggregates[alias] = [
      associationName,
      getBuilder ? getBuilder(initialBuilder as TAssociations[TName][1]) : initialBuilder,
    ]

    return this
  }

  /**
   * Modifies the query based on the passed in GraphQLResolveInfo object.
   *
   * An optional `path` parameter can be passed in when the model will be returned as part of a more deeply nested field.
   * For example, the type of the field being returned might be `CreatePostPayload` with a field named `post` and it's this
   * field we're populating using a PostFindByIdBuilder instance. In this case, we would pass in a value of "post" for the
   * `path` to identify the correct selection set and arguments to be parsed. The path can be arbitrarily deep, with each
   * level separated by a period, for example: "result.post".
   */
  public resolveInfo(info: GraphQLResolveInfo, path?: string) {
    let tree = parseResolveInfo(info)!

    if (path) {
      tree = _.get(
        tree,
        path
          .split('.')
          .map(fieldName => `fields.${fieldName}`)
          .join('.')
      )

      if (!tree) {
        return this
      }
    }

    const { fields } = tree

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      if (field.name in this._model.fields) {
        this.addSelect(field.name)
      } else if (field.name in this._model.dependencies) {
        this._model.dependencies[field.name].forEach(columnName => this.addSelectRaw(columnName))
      } else if (field.name in this._model.associations) {
        this.load(field.name as Extract<keyof TAssociations, string>, field.alias, builder =>
          builder.resolveInfo(field)
        )
      } else if (field.name in this._model.aggregates) {
        this.loadAggregate(this._model.aggregates[field.name] as any, field.alias, builder =>
          builder.resolveInfo(field)
        )
      }
    })

    return this
  }

  /**
   * Executes the query and returns a Promise that will resolve to the found row.
   */
  public async execute<TRow = TSelected & TRawSelected & TLoaded>() {
    const rows = await this.toQueryBuilder()

    // We use JSON aggregation for loading related models and SQLite returns those fields as strings
    if (this._dialect === 'sqlite') {
      const jsonFields = [...Object.keys(this._loadedAssociations), ...Object.keys(this._loadedAggregates)]
      rows.forEach((row: any) => {
        Object.keys(row).forEach(fieldName => {
          if (jsonFields.includes(fieldName)) {
            row[fieldName] = JSON.parse(row[fieldName])
          }
        })
      })
    }

    return (rows[0] as TRow) || null
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(context?: QueryBuilderContext): Knex.QueryBuilder {
    if (!context) {
      return this.toQueryBuilder({ alias: {} })
    }
    const tableAlias = getAlias(this._tableName || this._modelName, context)
    const throughAlias =
      context.nested && context.nested.association.through ? getAlias(context.nested.association.through, context) : ''
    const expressions: Expressions = {
      select: {},
      join: [],
      where: [],
      groupBy: [],
      orderBy: [],
    }

    this._addSelectExpressions(tableAlias, expressions, context)
    this._addJoinExpressions(tableAlias, throughAlias, expressions, context)

    const query = this._knex.queryBuilder()

    if (Object.keys(expressions.select).length) {
      query.select(expressions.select)
    } else {
      query.select(this._knex.raw('null'))
    }

    if (this._tableName) {
      query.from({ [tableAlias]: this._tableName })
    } else {
      query.with(tableAlias, this._knex.raw(this._cte!)).from(tableAlias)
    }

    expressions.join.forEach(join => (query as any)[join.type](join.table, join.on))

    query.where(`${tableAlias}.${this._primaryKey}`, this._id)

    expressions.where.forEach(whereArgs => (query.where as any)(...whereArgs))

    if (expressions.groupBy.length) {
      query.groupBy(expressions.groupBy)
    }

    query.limit(1)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
