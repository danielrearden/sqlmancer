import { DocumentNode } from 'graphql'
import { loadDocumentsSync, OPERATION_KINDS } from '@graphql-toolkit/core'
import { GraphQLFileLoader } from '@graphql-toolkit/graphql-file-loader'
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader'
import { mergeTypeDefs } from '@graphql-toolkit/schema-merging'

export function getTypeDefsFromGlob(glob: string) {
  try {
    const documents = loadDocumentsSync(glob, {
      loaders: [new CodeFileLoader(), new GraphQLFileLoader()],
      filterKinds: OPERATION_KINDS,
    }).map((source) => source.document as DocumentNode)
    return mergeTypeDefs(documents)
  } catch (e) {
    return null
  }
}
