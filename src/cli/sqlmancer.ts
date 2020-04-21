#!/usr/bin/env node

import mkdirp from 'mkdirp'
import ts from 'typescript'
import Ora from 'ora'
import { Command } from 'commander'
import { createWriteStream, unlinkSync } from 'fs'
import { join } from 'path'

import { generateClientFromSchema, getTypeDefsFromGlob } from '../generate'
import { makeSqlmancerSchema } from '../directives'
import { GraphQLSchema } from 'graphql'

const pkg = require('../../package.json')

const program = new Command()

program.version(pkg.version)

program
  .command('generate <typeDefs> <outputPath>', { isDefault: true })
  .description('generate database client from type definitions', {
    typeDefs:
      'Glob pattern to match any files containing your type definitions. These can be plain text files or JavaScript/TypeScript files that use the gql tag',
    outputPath:
      "Directory where the generated files will be created. If a directory doesn't already exist, one will be created.",
  })
  .action((typeDefs, output) => {
    const spinner = Ora({ color: 'magenta' })

    spinner.start(`Looking for type definitions using glob pattern "${typeDefs}"`)
    const documents = getTypeDefsFromGlob(typeDefs)
    if (documents.length) {
      spinner.succeed(`Found ${documents.length} document(s) with type definitions using glob pattern "${typeDefs}"`)
    } else {
      spinner.fail(`Found no valid type definitions using glob pattern "${typeDefs}"`)
      process.exit(1)
    }

    spinner.start(`Building schema from type definitions`)
    let schema: GraphQLSchema

    try {
      schema = makeSqlmancerSchema({
        typeDefs: documents,
        resolverValidationOptions: { requireResolversForResolveType: false },
      })
    } catch (e) {
      spinner.fail(
        `An error was encountered while building a schema from the provided type definitions:\n\n${e.message}\n`
      )
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

    stream.end(() => {
      spinner.succeed(`Successfully generated client module`)
      spinner.start('Transpiling and generating type definitions for client module')
      try {
        const program = ts.createProgram([filePath], { declaration: true, noImplicitAny: true })
        program.emit()
        unlinkSync(filePath)
      } catch (e) {
        spinner.fail(`Error encountered while transpiling client:\n\n${e.message}`)
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
  })

program.parse(process.argv)
