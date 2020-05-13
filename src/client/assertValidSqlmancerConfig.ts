import { SqlmancerConfig } from '../types'

export class SqlmancerConfigError extends Error {}

export class SqlmancerConfigValueError extends SqlmancerConfigError {
  constructor(key: string, value: any, possibleValues: any[]) {
    const possibleValuesString = possibleValues.map((value) => `${JSON.stringify(value)}`).join(', ')
    const message = `"${value}" is not a valid value for ${key}. Possible values: ${possibleValuesString}.`
    super(message)
  }
}

export function assertValidSqlmancerConfig(config: SqlmancerConfig): void {
  assertValidDialect(config)
  assertValidTransformFieldNames(config)
  assertValidCustomScalarMap(config)
  assertValidModels(config)
}

function assertValidDialect({ dialect }: SqlmancerConfig): void {
  const dialects = ['postgres', 'mysql', 'mariadb', 'sqlite']
  if (!dialects.includes(dialect)) {
    throw new SqlmancerConfigValueError('dialect', dialect, dialects)
  }
}

function assertValidTransformFieldNames({ transformFieldNames }: SqlmancerConfig): void {
  const transforms = ['CAMEL_CASE', 'PASCAL_CASE', 'SNAKE_CASE']
  if (transformFieldNames && !transforms.includes(transformFieldNames)) {
    throw new SqlmancerConfigValueError('transformFieldNames', transformFieldNames, transforms)
  }
}

function assertValidCustomScalarMap({ customScalarMap }: SqlmancerConfig): void {
  const mappedTypes = ['ID', 'string', 'number', 'boolean', 'JSON', 'Date']
  if (customScalarMap) {
    Object.keys(customScalarMap).forEach((scalarName) => {
      const mappedType = customScalarMap[scalarName]
      if (!mappedTypes.includes(mappedType)) {
        throw new SqlmancerConfigValueError('customScalarMap', mappedType, mappedTypes)
      }
    })
  }
}

function assertValidModels({ models }: SqlmancerConfig): void {
  Object.keys(models).forEach((modelName) => {
    const { tableName, cte, readOnly, associations } = models[modelName]
    if (!tableName && !cte) {
      throw new SqlmancerConfigError(`Model ${modelName} should include either a table name or a CTE`)
    }
    if (tableName && cte) {
      throw new SqlmancerConfigError(`Model ${modelName} cannot include both a table name and a CTE`)
    }
    if (cte && readOnly === false) {
      throw new SqlmancerConfigError(`Model ${modelName} cannot be read-only if it includes a CTE`)
    }
    Object.keys(associations).forEach((associationName) => {
      const { on, through } = associations[associationName]
      if (!on) {
        throw new SqlmancerConfigError(`Association ${associationName} on model ${modelName} is missing "on" property.`)
      }
      if (through) {
        if (on.length !== 2) {
          throw new SqlmancerConfigError(
            `Property "on" for association ${associationName} on model ${modelName} must have length of 2.`
          )
        }
      } else {
        if (on.length !== 1) {
          throw new SqlmancerConfigError(
            `Property "on" for association ${associationName} on model ${modelName} must have length of 1.`
          )
        }
      }
    })
  })
}
