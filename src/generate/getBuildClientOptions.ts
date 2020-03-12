import { join } from 'path'
import { BuildClientOptions } from './types'

export function getBuildClientOptions(flags: Partial<BuildClientOptions>): BuildClientOptions {
  let configFile: Partial<BuildClientOptions> = {}

  try {
    configFile = require(join(process.cwd(), flags.config || './sqlmancer.config.js'))
  } catch (e) {
    // No file found, move on
  }

  const options = {
    dialect: flags.dialect || configFile.dialect || 'postgres',
    typeDefs: flags.typeDefs || configFile.typeDefs || './**/*.graphql',
    output: flags.output || configFile.output || 'generated',
    transformFieldNames: flags.transformFieldNames || configFile.transformFieldNames,
  }

  const dialects = ['postgres']
  if (!dialects.includes(options.dialect)) {
    throw new Error(
      `Invalid value for option dialect: "${options.dialect}". Value should be one of: ${dialects.join(', ')}.`
    )
  }

  const transforms = ['CAMEL_CASE', 'PASCAL_CASE', 'SNAKE_CASE']
  if (options.transformFieldNames && !transforms.includes(options.transformFieldNames)) {
    throw new Error(
      `Invalid value for option transformFieldNames: "${
      options.transformFieldNames
      }". Value should be one of: ${transforms.join(', ')}.`
    )
  }

  return options
}
