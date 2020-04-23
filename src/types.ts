export type ID = number | string

export type SqlmancerConfig = {
  dialect: Dialect
  transformFieldNames?: FieldNameTransformation
  customScalars?: CustomScalars
}

export type Dialect = 'postgres' | 'mysql' | 'mariadb' | 'sqlite'

export type FieldNameTransformation = 'CAMEL_CASE' | 'PASCAL_CASE' | 'SNAKE_CASE'

export type CustomScalars = {
  string?: string[]
  number?: string[]
  boolean?: string[]
  JSON?: string[]
}
