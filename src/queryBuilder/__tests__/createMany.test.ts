import { withDialects } from './__utilties__'
import { ActorCreateManyBuilder } from './__fixtures__/models'

describe('CreateManyBuilder', () => {
  withDialects((options, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = new ActorCreateManyBuilder(options, [
          { firstName: 'SUSAN', lastName: 'ANTHONY' },
          { firstName: 'VIRGINIA', lastName: 'WOLF' },
        ])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeArray())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('non-existent field', async () => {
        const builder = new ActorCreateManyBuilder(options, [
          { firstName: 'SUSAN', lastName: 'ANTHONY', foo: 'bar' },
          { firstName: 'VIRGINIA', lastName: 'WOLF', foo: 'bar' },
        ] as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeArray())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
