#!/usr/bin/env node

import _ from 'lodash'
import mkdirp from 'mkdirp'
import chokidar from 'chokidar'
import Ora from 'ora'
import { Command } from 'commander'
import { createWriteStream } from 'fs'
import { join } from 'path'

import { generateClientTypeDeclarations, getTypeDefsFromGlob } from '../generate'
import { makeSqlmancerSchema } from '../directives'
import { DocumentNode, GraphQLSchema } from 'graphql'

const pkg = require('../../package.json')

let previousDocumentNode: DocumentNode

const program = new Command()

program.version(pkg.version)

program
  .command('generate <typeDefs> <outputPath>')
  .description('generates TypeScript typings for the database client from the provided GraphQL type definitions', {
    typeDefs:
      'Glob pattern to match any files containing your type definitions. These can be plain text files or JavaScript/TypeScript files that use the gql tag',
    outputPath:
      "Directory where the generated files will be created. If a directory doesn't already exist, one will be created.",
  })
  .action(generate)

program
  .command('watch <typeDefs> <outputPath>')
  .description(
    'watches the provided GraphQL type definitions and generates typings for the database client again if any type definitions changed',
    {
      typeDefs:
        'Glob pattern to match any files containing your type definitions. These can be plain text files or JavaScript/TypeScript files that use the gql tag',
      outputPath:
        "Directory where the generated files will be created. If a directory doesn't already exist, one will be created.",
    }
  )
  .action((typeDefs: string, output: string) => {
    chokidar.watch(typeDefs).on('all', () => {
      generate(typeDefs, output)
    })
  })

program.parse(process.argv)

function generate(typeDefs: string, output: string): void {
  const start = Date.now()
  const documentNode = getTypeDefsFromGlob(typeDefs) as DocumentNode
  if (_.isEqual(JSON.stringify(documentNode), JSON.stringify(previousDocumentNode))) {
    return
  }

  previousDocumentNode = documentNode

  const spinner = Ora({ color: 'magenta' })

  spinner.start('Generating typings for Sqlmancer client...')

  if (!documentNode || !documentNode.definitions.length) {
    spinner.fail(`Found no files with valid type definitions using glob pattern "${typeDefs}"`)
    process.exit(1)
  }

  let schema: GraphQLSchema

  try {
    schema = makeSqlmancerSchema({
      typeDefs: documentNode,
      resolverValidationOptions: { requireResolversForResolveType: false },
    })
  } catch (e) {
    spinner.fail(
      `An error was encountered while building a schema from the provided type definitions:\n\n${e.message}\n`
    )
    throw e
    process.exit(1)
  }

  const dirPath = join(process.cwd(), output)
  const filePath = join(dirPath, 'sqlmancer.d.ts')

  mkdirp.sync(dirPath)

  const stream = createWriteStream(filePath)
  stream.on('error', e => {
    spinner.fail(`Failed\n\n${e.message}`)
    process.exit(1)
  })

  try {
    generateClientTypeDeclarations(schema, stream)
  } catch (e) {
    spinner.fail(`An error was encountered while generating the client:\n\n${e.message}\n`)
    process.exit(1)
  }

  stream.end(async () => {
    const stop = Date.now()
    spinner.succeed(`Successfully generated typings for Sqlmancer client in ${stop - start} ms`)
  })
}
