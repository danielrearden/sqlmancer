import { makeExecutableSchema, SchemaDirectiveVisitor, IExecutableSchemaDefinition } from 'graphql-tools-fork'
import { parse, DocumentNode } from 'graphql'

import { ColumnDirective } from './column'
import { HasDefaultDirective } from './has-default'
import { DependDirective } from './depend'
import { IgnoreDirective } from './ignore'
import { JoinDirective } from './join'
import { LimitDirective } from './limit'
import { ManyDirective } from './many'
import { ModelDirective } from './model'
import { OffsetDirective } from './offset'
import { OrderByDirective } from './orderBy'
import { PrivateDirective } from './private'
import { ValueDirective } from './value'
import { WhereDirective } from './where'

export const schemaDirectives: Record<string, typeof SchemaDirectiveVisitor> = {
  col: ColumnDirective,
  depend: DependDirective,
  hasDefault: HasDefaultDirective,
  ignore: IgnoreDirective,
  join: JoinDirective,
  limit: LimitDirective,
  offset: OffsetDirective,
  orderBy: OrderByDirective,
  private: PrivateDirective,
  many: ManyDirective,
  model: ModelDirective,
  value: ValueDirective,
  where: WhereDirective,
}

export const typeDefs: DocumentNode = parse(`
  directive @col(
    name: String!
  ) on FIELD_DEFINITION

  directive @depend(
    on: [String!]!
  ) on FIELD_DEFINITION

  directive @hasDefault on FIELD_DEFINITION

  directive @ignore on FIELD_DEFINITION

  directive @join(
    on: [SqlmancerJoinOn!]!
    through: String
  ) on FIELD_DEFINITION

  directive @limit on FIELD_DEFINITION

  directive @many(
    model: String
  ) on FIELD_DEFINITION

  directive @model(
    table: String!
    pk: String!
    include: [String!]
  ) on OBJECT | UNION | INTERFACE

  directive @offset on FIELD_DEFINITION

  directive @orderBy(
    model: String
  ) on FIELD_DEFINITION

  directive @private on FIELD_DEFINITION | OBJECT | UNION | INTERFACE

  directive @sqlmancer(
    config: SqlmancerConfig!
  ) on OBJECT

  directive @value(string: String!) on ENUM_VALUE

  directive @where(
    model: String
  ) on FIELD_DEFINITION

  input SqlmancerConfig {
    dialect: SqlmancerDialect!
    transformFieldNames: SqlmancerFieldNameTransformation
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
`)

export const makeSqlmancerSchema = (config: IExecutableSchemaDefinition) =>
  makeExecutableSchema({
    ...config,
    typeDefs: Array.isArray(config.typeDefs) ? [...config.typeDefs, typeDefs] : [config.typeDefs, typeDefs],
    schemaDirectives: config.schemaDirectives ? { ...config.schemaDirectives, ...schemaDirectives } : schemaDirectives,
  })

export { ColumnDirective } from './column'
export { HasDefaultDirective } from './has-default'
export { DependDirective } from './depend'
export { IgnoreDirective } from './ignore'
export { JoinDirective } from './join'
export { LimitDirective } from './limit'
export { ManyDirective } from './many'
export { ModelDirective } from './model'
export { OffsetDirective } from './offset'
export { OrderByDirective } from './orderBy'
export { PrivateDirective } from './private'
export { ValueDirective } from './value'
export { WhereDirective } from './where'
