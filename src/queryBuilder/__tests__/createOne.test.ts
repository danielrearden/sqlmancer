import { withDialects } from './__utilties__'
import { ActorCreateOneBuilder } from './__fixtures__/models'

describe('CreateOneBuilder', () => {
  withDialects((options, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = new ActorCreateOneBuilder(options, { firstName: 'SUSAN', lastName: 'ANTHONY' })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('non-existent field', async () => {
        const builder = new ActorCreateOneBuilder(options, {
          firstName: 'SUSAN',
          lastName: 'ANTHONY',
          foo: 'bar',
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
