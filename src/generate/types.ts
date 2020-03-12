export interface BuildClientOptions {
  dialect: 'postgres'
  transformFieldNames?: 'CAMEL_CASE' | 'PASCAL_CASE' | 'SNAKE_CASE'
  typeDefs: string
  output: string
  config?: string
}
