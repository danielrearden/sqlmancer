import _ from 'lodash'
import { withDialects } from '../utilities'

describe('CreateManyBuilder', () => {
  withDialects((client, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = client.models.Actor.createMany([
          { firstName: 'SUSAN', lastName: 'ANTHONY' },
          { firstName: 'VIRGINIA', lastName: 'WOLF' },
        ])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, (result) => expect(_.isArray(result)).toBe(true))
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('non-existent field', async () => {
        const builder = client.models.Actor.createMany([
          { firstName: 'SUSAN', lastName: 'ANTHONY', foo: 'bar' },
          { firstName: 'VIRGINIA', lastName: 'WOLF', foo: 'bar' },
        ] as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, (result) => expect(_.isArray(result)).toBe(true))
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
