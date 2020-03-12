import { withDialects } from './__utilties__'
import { ActorDeleteByIdBuilder } from './__fixtures__/models'

describe('DeleteBuilder', () => {
  withDialects((options, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = new ActorDeleteByIdBuilder(options, 20)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeBoolean())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
