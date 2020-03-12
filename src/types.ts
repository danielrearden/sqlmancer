import { GraphQLOutputType } from 'graphql'

export type ModelDetails = {
  fields: { fieldName: string; columnName?: string; type: GraphQLOutputType; hasDefault: boolean }[]
  joins: { fieldName: string; type: GraphQLOutputType; on: { from: string; to: string }[]; through?: string }[]
  dependencies: { fieldName: string; columns: string[] }[]
}
