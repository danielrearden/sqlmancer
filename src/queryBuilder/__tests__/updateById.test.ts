import { withDialects } from './__utilties__'
import { ActorUpdateByIdBuilder } from './__fixtures__/models'

describe('UpdateManyBuilder', () => {
  withDialects((options, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = new ActorUpdateByIdBuilder(options, 10, { firstName: 'YENNEFER' })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeBoolean())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('non-existent field', async () => {
        const builder = new ActorUpdateByIdBuilder(options, 10, {
          firstName: 'YENNEFER',
          lastNam: 'OF VENGERBERG',
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeBoolean())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
