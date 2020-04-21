import { GraphQLOutputType } from 'graphql'

export type SqlmancerConfig = {
  dialect: Dialect
}

export type Dialect = 'postgres' | 'mysql' | 'mariadb' | 'sqlite'

export type FieldNameTransformation = 'CAMEL_CASE' | 'PASCAL_CASE' | 'SNAKE_CASE' | undefined

export type ModelDetails = {
  fields: { fieldName: string; columnName?: string; type: GraphQLOutputType; hasDefault: boolean }[]
  joins: { fieldName: string; type: GraphQLOutputType; on: { from: string; to: string }[]; through?: string }[]
  dependencies: { fieldName: string; columns: string[] }[]
}
