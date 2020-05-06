import { makeExecutableSchema, SchemaDirectiveVisitor, IExecutableSchemaDefinition } from 'graphql-tools'
import { parse, DocumentNode } from 'graphql'

import { AggregateDirective } from './aggregate'
import { RelateDirective } from './relate'
import { LimitDirective } from './limit'
import { ManyDirective } from './many'
import { ModelDirective } from './model'
import { OffsetDirective } from './offset'
import { OrderByDirective } from './orderBy'
import { PrivateDirective } from './private'
import { ValueDirective } from './value'
import { WhereDirective } from './where'

export const schemaDirectives: { [name: string]: typeof SchemaDirectiveVisitor } = {
  aggregate: AggregateDirective,
  limit: LimitDirective,
  offset: OffsetDirective,
  orderBy: OrderByDirective,
  private: PrivateDirective,
  relate: RelateDirective,
  many: ManyDirective,
  model: ModelDirective,
  value: ValueDirective,
  where: WhereDirective,
}

export const typeDefs: DocumentNode = parse(`
  directive @aggregate on FIELD_DEFINITION

  directive @col(
    name: String!
  ) on FIELD_DEFINITION

  directive @depend(
    on: [String!]!
  ) on FIELD_DEFINITION

  directive @hasDefault on FIELD_DEFINITION

  directive @ignore on FIELD_DEFINITION

  directive @limit on FIELD_DEFINITION

  directive @many(
    model: String
  ) on FIELD_DEFINITION

  directive @model(
    table: String
    cte: String
    pk: String!
    readOnly: Boolean = false
    include: [String!]
  ) on OBJECT | UNION | INTERFACE

  directive @offset on FIELD_DEFINITION

  directive @orderBy(
    model: String
  ) on FIELD_DEFINITION

  directive @private on FIELD_DEFINITION | OBJECT | UNION | INTERFACE

  directive @relate(
    on: [SqlmancerJoinOn!]
    through: String
    aggregate: String
  ) on FIELD_DEFINITION

  directive @sqlmancer(
    dialect: SqlmancerDialect!
    transformFieldNames: SqlmancerFieldNameTransformation
    customScalars: SqlmancerCustomScalars
  ) on OBJECT

  directive @value(is: String!) on ENUM_VALUE

  directive @where(
    model: String
  ) on FIELD_DEFINITION

  input SqlmancerCustomScalars {
    string: [String!]
    number: [String!]
    boolean: [String!]
    JSON: [String!]
    Date: [String!]
  }

  input SqlmancerJoinOn {
    from: String!
    to: String!
  }

  enum SqlmancerDialect {
    POSTGRES
    MYSQL
    MARIADB
    SQLITE
  }

  enum SqlmancerFieldNameTransformation {
    CAMEL_CASE
    PASCAL_CASE
    SNAKE_CASE
  }

  enum SqlmancerAggregateFunction {
    avg
    count
    max
    min
    sum
  }
`)

export const makeSqlmancerSchema = (config: IExecutableSchemaDefinition) =>
  makeExecutableSchema({
    ...config,
    typeDefs: Array.isArray(config.typeDefs) ? [...config.typeDefs, typeDefs] : [config.typeDefs, typeDefs],
    schemaDirectives: config.schemaDirectives ? { ...config.schemaDirectives, ...schemaDirectives } : schemaDirectives,
  })

export { AggregateDirective } from './aggregate'
export { LimitDirective } from './limit'
export { ManyDirective } from './many'
export { ModelDirective } from './model'
export { OffsetDirective } from './offset'
export { OrderByDirective } from './orderBy'
export { PrivateDirective } from './private'
export { RelateDirective } from './relate'
export { ValueDirective } from './value'
export { WhereDirective } from './where'
