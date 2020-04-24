#!/usr/bin/env node

import _ from 'lodash'
import mkdirp from 'mkdirp'
import chokidar from 'chokidar'
import Ora from 'ora'
import { Command } from 'commander'
import { createWriteStream, unlinkSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'

import { generateClientFromSchema, getTypeDefsFromGlob } from '../generate'
import { makeSqlmancerSchema } from '../directives'
import { DocumentNode, GraphQLSchema } from 'graphql'

const pkg = require('../../package.json')

let previousDocumentNode: DocumentNode

const program = new Command()

program.version(pkg.version)

program
  .command('generate <typeDefs> <outputPath>')
  .description('generate database client from type definitions', {
    typeDefs:
      'Glob pattern to match any files containing your type definitions. These can be plain text files or JavaScript/TypeScript files that use the gql tag',
    outputPath:
      "Directory where the generated files will be created. If a directory doesn't already exist, one will be created.",
  })
  .action(generate)

program
  .command('watch <typeDefs> <outputPath>')
  .description(
    'watches the provided type definitions and generates the database client again if any type definitions changed',
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
  const documentNode = getTypeDefsFromGlob(typeDefs) as DocumentNode
  if (_.isEqual(JSON.stringify(documentNode), JSON.stringify(previousDocumentNode))) {
    return
  }

  previousDocumentNode = documentNode

  const spinner = Ora({ color: 'magenta' })

  spinner.start(`Looking for type definitions using glob pattern "${typeDefs}"`)

  if (documentNode.definitions.length) {
    spinner.succeed(`Found one or more files with valid type definitions using glob pattern "${typeDefs}"`)
  } else {
    spinner.fail(`Found no files with valid type definitions using glob pattern "${typeDefs}"`)
    process.exit(1)
  }

  spinner.start(`Building schema from type definitions`)
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

  spinner.succeed('Successfully built schema from type definitions')

  const dirPath = join(process.cwd(), output)
  const filePath = join(dirPath, 'sqlmancer.ts')
  spinner.start(`Creating directory at "${dirPath}"`)

  const created = mkdirp.sync(dirPath)
  spinner.succeed(created ? `Directory created at "${dirPath}"` : `Directory already exists at "${dirPath}"`)

  spinner.start('Generating client module')
  const stream = createWriteStream(filePath)
  stream.on('error', e => {
    spinner.fail(`Failed\n\n${e.message}`)
    process.exit(1)
  })

  try {
    generateClientFromSchema(schema, stream)
  } catch (e) {
    spinner.fail(`An error was encountered while generating the client:\n\n${e.message}\n`)
    process.exit(1)
  }

  stream.end(async () => {
    spinner.succeed(`Successfully generated client module`)
    spinner.start('Transpiling and generating type definitions for client module')
    try {
      await new Promise((resolve, reject) =>
        exec(
          `node -e "const ts = require('typescript'); ts.createProgram(['${filePath}'], { declaration: true, target: 'es2018' }).emit();"`,
          error => (error ? reject(error) : resolve())
        )
      )
      unlinkSync(filePath)
    } catch (e) {
      spinner.fail(`Error encountered while transpiling client:\n\n${e.message}`)
      process.exit(1)
    }

    spinner.succeed('Transpiled and generated type definitions for client module')

    spinner.stopAndPersist({
      symbol: '\n🎉',
      text: `Sqlmancer client has been generated successfully and can now be imported from "${filePath.substring(
        0,
        filePath.length - 2
      )}js"\n`,
    })
  })
}
