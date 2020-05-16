import _ from 'lodash'
import Knex from 'knex'
import {
  AggregateFields,
  Association,
  BuilderOptions,
  Expressions,
  Models,
  OrderBy,
  OrderByDirection,
  OrderByAssociation,
  QueryBuilderContext,
  Where,
  WhereAggregate,
  WhereArgs,
  WhereAssociations,
  WhereFields,
} from '../types'
import { Dialect } from '../types'
import {
  getAggregateFunction,
  getAlias,
  getComparisonExpression,
  getDirection,
  getJsonAggregateExpressionByDialect,
} from './utilities'

const AGGREGATE_KEYS = ['avg', 'max', 'min', 'sum', 'count']

export abstract class BaseBuilder {
  protected readonly _modelName: string
  protected readonly _models: Models
  protected readonly _model: Models[string]
  protected readonly _tableName?: string
  protected readonly _cte?: string
  protected readonly _primaryKey: string
  protected readonly _options: BuilderOptions
  protected readonly _knex: Knex
  protected readonly _dialect: Dialect

  protected _select: any[] = []
  protected _rawSelect: Record<string, string> = {}
  protected _loadedAssociations: Record<string, [any, any]> = {}
  protected _loadedPaginated: Record<string, [any, any]> = {}
  protected _where: Where<any, any, any, any, any> = {}
  protected _orderBy: OrderBy<any, any>[] = []
  protected _limit = 0
  protected _offset = 0
  protected _transaction: Knex.Transaction | null

  constructor(options: BuilderOptions, modelName: string, models: Models) {
    this._options = options
    this._knex = options.knex
    this._dialect = options.dialect
    this._modelName = modelName
    this._models = models
    this._model = models[modelName]
    this._tableName = this._model.tableName
    this._cte = this._model.cte
    this._primaryKey = this._model.primaryKey
  }

  /**
   * Sets the transaction inside which the query will be executed.
   */
  public transaction(transaction: Knex.Transaction | null) {
    this._transaction = transaction
    return this
  }

  public abstract async execute(): Promise<any>

  public abstract toQueryBuilder(): Knex.QueryBuilder

  protected _addSelectExpressions(tableAlias: string, expressions: Expressions, context: QueryBuilderContext): void {
    this._select.forEach((fieldName) => {
      const field = this._model.fields[fieldName]
      if (field) {
        expressions.select[fieldName as string] = `${tableAlias}.${field.column}`
      }
    })

    this._model.include.forEach((included) => {
      expressions.select[included] = `${tableAlias}.${included}`
    })

    Object.keys(this._rawSelect).forEach((alias) => {
      expressions.select[alias] = `${tableAlias}.${this._rawSelect[alias]}`
    })

    _.forIn(this._loadedAssociations, ([associationName, builder], alias) => {
      const subqueryAlias = getAlias(alias, context)
      const association = this._model.associations[associationName]
      const nestedContext: QueryBuilderContext = {
        ...context,
        nested: {
          outerAlias: tableAlias,
          association,
        },
      }
      const jsonAggExpression = getJsonAggregateExpressionByDialect(
        this._dialect,
        association.isMany,
        this._knex.ref(`${subqueryAlias}.o`)
      )
      expressions.select[alias] = this._knex
        .queryBuilder()
        .select(this._knex.raw(jsonAggExpression))
        .from(builder.toQueryBuilder(nestedContext).as(subqueryAlias))
    })

    _.forIn(this._loadedPaginated, ([associationName, builder], alias) => {
      const subqueryAlias = getAlias(alias, context)
      const association = this._model.associations[associationName]
      const nestedContext: QueryBuilderContext = {
        ...context,
        nested: {
          outerAlias: tableAlias,
          association,
        },
      }

      expressions.select[alias] = this._knex
        .queryBuilder()
        .select(builder.toQueryBuilder(nestedContext).as(subqueryAlias))
    })
  }

  protected _addJoinExpressions(
    tableAlias: string,
    throughAlias: string,
    expressions: Expressions,
    context: QueryBuilderContext
  ): void {
    if (throughAlias) {
      const association = context.nested!.association
      expressions.join.push({
        type: 'innerJoin',
        table: { [throughAlias]: association.through! },
        on: { [`${throughAlias}.${association.on[1].from}`]: `${tableAlias}.${association.on[1].to}` },
      })
    }
  }

  protected _addWhereExpressions(
    tableAlias: string,
    throughAlias: string,
    expressions: Expressions,
    context: QueryBuilderContext
  ): void {
    if (context.nested) {
      const { association } = context.nested
      expressions.where.push([
        `${context.nested.outerAlias}.${association.on[0].from}`,
        this._knex.ref(`${throughAlias || tableAlias}.${association.on[0].to}`),
      ])
    }

    this._getWhereExpressions(this._where, this._modelName, tableAlias, context).forEach((exp) =>
      expressions.where.push(exp)
    )
  }

  protected _getWhereExpressions(
    where: Where<any, any, any, any, any>,
    modelName: string,
    tableAlias: string,
    context: QueryBuilderContext
  ): WhereArgs[] {
    const { fields, associations } = this._models[modelName]
    const keys = Object.keys(where)
    return keys.reduce((acc, key) => {
      if (key in fields) {
        acc.push([this._getFieldWhereExpression(key, where[key], modelName, tableAlias)])
      } else if (key in associations) {
        acc.push(
          this._getAssociationWhereExpression(
            key,
            where[key] as NonNullable<WhereAssociations<any>[typeof key]>,
            modelName,
            tableAlias,
            context
          )
        )
      } else if (key === 'and') {
        acc.push([
          (qb) => {
            const wheres = where[key] as NonNullable<Where<any, any, any, any, any>['and']>
            wheres.forEach((where) => {
              qb.andWhere((qb) => {
                this._getWhereExpressions(where, modelName, tableAlias, context).forEach((where) =>
                  (qb.andWhere as any)(...where)
                )
              })
            })
          },
        ])
      } else if (key === 'or') {
        acc.push([
          (qb) => {
            const wheres = where[key] as NonNullable<Where<any, any, any, any, any>['and']>
            wheres.forEach((where) => {
              qb.orWhere((qb) => {
                this._getWhereExpressions(where, modelName, tableAlias, context).forEach((where) =>
                  (qb.andWhere as any)(...where)
                )
              })
            })
          },
        ])
      } else if (key === 'not') {
        acc.push([
          (qb) =>
            qb.whereNot((qb) => {
              const whereNot = where[key] as NonNullable<Where<any, any, any, any, any>['not']>
              this._getWhereExpressions(whereNot, modelName, tableAlias, context).forEach((whereArgs) =>
                (qb.where as any)(...whereArgs)
              )
            }),
        ])
      }

      return acc
    }, [] as WhereArgs[])
  }

  protected _getFieldWhereExpression(
    field: string,
    operatorAndValue: WhereFields<any, any, any, any>[string],
    modelName: string,
    tableAlias: string,
    aggregateKey?: keyof AggregateFields
  ): Knex.Raw {
    const { fields } = this._models[modelName]
    const key = Object.keys(operatorAndValue!)[0]
    const value = (operatorAndValue as any)[key]
    return getComparisonExpression(
      this._knex,
      this._dialect,
      aggregateKey
        ? `${getAggregateFunction(aggregateKey)}(${this._knex.ref(`${tableAlias}.${fields[field].column}`)})`
        : this._knex.ref(`${tableAlias}.${fields[field].column}`),
      key,
      value
    )
  }

  protected _getAssociationWhereExpression(
    associationName: string,
    operatorAndValue: NonNullable<WhereAssociations<any>[string]>,
    modelName: string,
    tableAlias: string,
    context: QueryBuilderContext
  ): WhereArgs {
    const association = this._models[modelName].associations[associationName]
    const associationModel = this._models[association.modelName]
    const associationAlias = getAlias(associationModel.tableName || association.modelName, context)
    const throughAlias = association.through ? getAlias(association.through, context) : ''

    const query = this._knex.queryBuilder().select(this._knex.raw('null'))

    if (associationModel.tableName) {
      query.from({ [associationAlias]: associationModel.tableName })
    } else {
      query.with(associationAlias, this._knex.raw(this._cte!)).from(associationAlias)
    }

    query.where({
      [`${tableAlias}.${association.on[0].from}`]: this._knex.ref(
        `${association.through ? throughAlias : associationAlias}.${association.on[0].to}`
      ),
    })

    this._getWhereExpressions(
      _.pick(operatorAndValue, [
        ...Object.keys(associationModel.fields),
        ...Object.keys(associationModel.associations),
        'and',
        'or',
        'not',
      ]) as any,
      association.modelName,
      associationAlias,
      context
    ).forEach((args) => (query.andWhere as any)(...args))

    if (association.through) {
      query.innerJoin(
        { [throughAlias]: association.through },
        { [`${throughAlias}.${association.on[1].from}`]: `${associationAlias}.${association.on[1].to}` }
      )
    }

    if (association.isMany) {
      Object.keys(_.pick(operatorAndValue, AGGREGATE_KEYS)).forEach((aggregateKey: keyof AggregateFields | 'count') => {
        const where = (operatorAndValue as WhereAggregate<any, any, any, any, true>)[aggregateKey]
        if (aggregateKey === 'count') {
          const key = Object.keys(where!)[0]
          const value = (where as any)[key]
          query.havingRaw(
            getComparisonExpression(
              this._knex,
              this._dialect,
              `count(${this._knex.ref(`${associationAlias}.${associationModel.primaryKey}`)})`,
              key,
              value
            )
          )
        } else {
          Object.keys(where!).forEach((key) => {
            if (key in associationModel.fields) {
              query.having(
                this._getFieldWhereExpression(
                  key,
                  (where as any)[key],
                  association.modelName,
                  associationAlias,
                  aggregateKey
                )
              )
            }
          })
        }
      })

      query.groupBy([
        `${association.through ? throughAlias : associationAlias}.${association.on[association.through ? 1 : 0].to}`,
      ])
    }

    return [(qb) => qb.whereExists(query)]
  }

  protected _addOrderByExpressions(tableAlias: string, expressions: Expressions, context: QueryBuilderContext): void {
    this._orderBy.forEach((orderBy) => {
      const keys = Object.keys(orderBy)
      const key = keys[0]
      if (key in this._model.fields) {
        this._addFieldOrderByExpression(key, orderBy[key] as any, tableAlias, expressions)
      } else if (key in this._model.associations) {
        this._addAssociationOrderByExpression(key, orderBy[key] as any, tableAlias, expressions, context)
      }
    })
  }

  protected _addFieldOrderByExpression(
    fieldName: string,
    direction: OrderByDirection,
    tableAlias: string,
    expressions: Expressions
  ): void {
    const directionExpression = getDirection(direction)
    expressions.orderBy.push({
      column: `${tableAlias}.${this._model.fields[fieldName].column}`,
      order: directionExpression,
    })
  }

  protected _addAssociationOrderByExpression(
    associationName: string,
    orderBy: OrderByAssociation<any>,
    tableAlias: string,
    expressions: Expressions,
    context: QueryBuilderContext
  ): void {
    const association = this._model.associations[associationName]
    const associationModel = this._models[association.modelName]
    const joinedAlias = getAlias(associationModel.tableName || this._modelName, context)
    const throughAlias = association.through ? getAlias(association.through, context) : ''
    const { direction, selectExpression } = (association.isMany
      ? this._getAssociationAggregateOrderByExpressionParts
      : this._getAssociationFieldOrderByExpressionParts
    ).bind(this)(association, orderBy, joinedAlias)

    const query = this._knex.queryBuilder()

    query.select(selectExpression)

    if (association.through) {
      query.from({ [throughAlias]: association.through })
    } else if (associationModel.tableName) {
      query.from({ [joinedAlias]: associationModel.tableName })
    } else {
      query.with(joinedAlias, this._knex.raw(this._cte!)).from(joinedAlias)
    }

    if (association.through) {
      if (associationModel.tableName) {
        query.innerJoin(
          { [joinedAlias]: associationModel.tableName },
          { [`${throughAlias}.${association.on[1].from}`]: `${joinedAlias}.${association.on[1].to}` }
        )
      } else {
        query.with(joinedAlias, this._knex.raw(this._cte!)).innerJoin(joinedAlias, {
          [`${throughAlias}.${association.on[1].from}`]: `${joinedAlias}.${association.on[1].to}`,
        })
      }
    }

    query.where(
      `${tableAlias}.${association.on[0].from}`,
      this._knex.ref(`${association.through ? throughAlias : joinedAlias}.${association.on[0].to}`)
    )

    if (association.isMany) {
      query.groupBy([`${association.through ? throughAlias : joinedAlias}.${association.on[0].to}`])
    }

    expressions.orderBy.push({ column: query, order: direction })
  }

  protected _getAssociationFieldOrderByExpressionParts(
    association: Association,
    orderBy: OrderByAssociation<any>,
    joinedAlias: string
  ): {
    orderByColumnName: string
    direction: string
    selectExpression: string
  } {
    const associationModel = this._models[association.modelName]
    const associationFields = associationModel.fields
    const associationFieldNames = Object.keys(orderBy)
    const associationFieldName = associationFieldNames[0]

    if (!associationFields[associationFieldName]) {
      throw new Error(`Invalid field name for model ${association.modelName}: ${associationFieldName}`)
    }

    const orderByColumnName = associationFields[associationFieldName].column
    const direction = getDirection(orderBy[associationFieldName] as any)
    const selectExpression = `${joinedAlias}.${associationFields[associationFieldName].column}`

    return { orderByColumnName, direction, selectExpression }
  }

  protected _getAssociationAggregateOrderByExpressionParts(
    association: Association,
    orderBy: OrderByAssociation<any>,
    joinedAlias: string
  ): {
    orderByColumnName: string
    direction: string
    selectExpression: Knex.Raw
  } {
    const associationModel = this._models[association.modelName]
    const associationFields = associationModel.fields
    const aggregateKeys = Object.keys(orderBy)
    const aggregateKey = aggregateKeys[0]
    const orderByColumnName = `${aggregateKey}`

    let selectExpression: Knex.Raw
    let direction: string

    if (aggregateKey === 'count') {
      selectExpression = this._knex.raw(
        `count(${this._knex.ref(`${joinedAlias}.${associationModel.primaryKey}`)}) as ${this._knex.ref(
          orderByColumnName
        )}`
      )
      direction = getDirection(orderBy[aggregateKey] as any)
    } else {
      const fieldName = Object.keys(orderBy[aggregateKey] as any)[0]
      const field = associationFields[fieldName]

      if (!field) {
        throw new Error(`Invalid field name for model ${association.modelName}: ${fieldName}`)
      }

      selectExpression = this._knex.raw(
        `${getAggregateFunction(aggregateKey)}(${this._knex.ref(`${joinedAlias}.${field.column}`)}) as ${this._knex.ref(
          orderByColumnName
        )}`
      )
      direction = getDirection(
        (orderBy[aggregateKey] as {
          [x: string]: OrderByDirection
        })[fieldName]
      )
    }

    return { orderByColumnName, direction, selectExpression }
  }

  protected _applyExpressions(query: Knex.QueryBuilder, expressions: Expressions, includeLimitOffset = true) {
    expressions.join.forEach((join) => (query as any)[join.type](join.table, join.on))

    expressions.where.forEach((whereArgs) => (query.where as any)(...whereArgs))

    if (expressions.groupBy.length) {
      query.groupBy(expressions.groupBy)
    }

    if (expressions.orderBy.length) {
      query.orderBy(expressions.orderBy as any)
    }

    if (this._limit && includeLimitOffset) {
      query.limit(this._limit)
    }

    if (this._offset && includeLimitOffset) {
      query.offset(this._offset)
    }
  }
}
