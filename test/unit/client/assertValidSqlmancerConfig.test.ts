import { assertValidSqlmancerConfig } from '../../../lib/client/assertValidSqlmancerConfig'

describe('assertValidSqlmancerConfig', () => {
  const config = {
    dialect: 'postgres',
    transformFieldNames: undefined,
    customScalarMap: undefined,
    models: {
      User: {
        tableName: 'users',
        cte: undefined,
        readOnly: false,
        associations: {
          friends: {
            modelName: 'User',
            isMany: true,
            isPrivate: false,
            on: [{ from: 'a', to: 'b' }],
            through: undefined,
          },
        },
        fields: {},
        aggregates: {},
        builders: {},
      },
    },
  }

  test('assertValidDialect', () => {
    expect(() => assertValidSqlmancerConfig({ ...config, dialect: 'mongodb' } as any)).toThrow('dialect')
  })

  test('assertValidTransformFieldNames', () => {
    expect(() => assertValidSqlmancerConfig({ ...config, transformFieldNames: 'NOT_A_CASE' } as any)).toThrow(
      'transformFieldNames'
    )
  })

  test('assertValidCustomScalarMap', () => {
    expect(() => assertValidSqlmancerConfig({ ...config, customScalarMap: { JSON: 'json' } } as any)).toThrow(
      'customScalarMap'
    )
  })

  test('assertValidModels', () => {
    let User = { ...config.models.User, tableName: undefined, cte: undefined } as any
    expect(() => assertValidSqlmancerConfig({ ...config, models: { User } } as any)).toThrow(
      'should include either a table name or a CTE'
    )
    User = { ...config.models.User, tableName: 'users', cte: 'SELECT * FROM users' }
    expect(() => assertValidSqlmancerConfig({ ...config, models: { User } } as any)).toThrow(
      'cannot include both a table name and a CTE'
    )
    User = { ...config.models.User, tableName: undefined, readOnly: false, cte: 'SELECT * FROM users' }
    expect(() => assertValidSqlmancerConfig({ ...config, models: { User } } as any)).toThrow(
      'cannot be read-only if it includes a CTE'
    )
    User = { ...config.models.User, associations: { friends: { ...config.models.User.associations.friends, on: [] } } }
    expect(() => assertValidSqlmancerConfig({ ...config, models: { User } } as any)).toThrow(
      'Property "on" for association friends on model User must have length of 1.'
    )
    User = {
      ...config.models.User,
      associations: { friends: { ...config.models.User.associations.friends, through: 'c', on: [] } },
    }
    expect(() => assertValidSqlmancerConfig({ ...config, models: { User } } as any)).toThrow(
      'Property "on" for association friends on model User must have length of 2.'
    )
  })
})
