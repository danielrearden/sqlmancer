import { withDialects } from '../../__tests__/utilities'

describe('UpdateManyBuilder', () => {
  withDialects((client, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = client.models.Actor.updateById(10, { firstName: 'YENNEFER' })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, (result) => expect(result).toBeBoolean())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('non-existent field', async () => {
        const builder = client.models.Actor.updateById(10, {
          firstName: 'YENNEFER',
          lastNam: 'OF VENGERBERG',
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, (result) => expect(result).toBeBoolean())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
