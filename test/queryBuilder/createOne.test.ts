import _ from 'lodash'
import { withDialects } from '../utilities'

describe('CreateOneBuilder', () => {
  withDialects((client, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = client.models.Actor.createOne({ firstName: 'SUSAN', lastName: 'ANTHONY' })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, (result) => expect(_.isInteger(result)).toBe(true))
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('non-existent field', async () => {
        const builder = client.models.Actor.createOne({
          firstName: 'SUSAN',
          lastName: 'ANTHONY',
          foo: 'bar',
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, (result) => expect(_.isInteger(result)).toBe(true))
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
