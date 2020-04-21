import { withDialects } from './__utilties__'
import { ActorDeleteManyBuilder, FilmDeleteManyBuilder, LanguageDeleteManyBuilder } from './__fixtures__/models'

describe('DeleteBuilder', () => {
  withDialects((options, rollback) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = new ActorDeleteManyBuilder(options)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('where', () => {
      test('with one field', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({ firstName: { equal: 'BOB' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with two field', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          firstName: { equal: 'BOB' },
          lastName: { equal: 'GOODALL' },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('equals null', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          firstName: { equal: null },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('notEqual null', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          firstName: { notEqual: null },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with extra operators', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({ firstName: { equal: 'BOB', notEqual: 'SUSAN' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent field', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          firstNam: { equal: 'BOB' },
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({})
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('and', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          and: [{ firstName: { equal: 'BOB' } }, { lastName: { equal: 'FAWCETT' } }],
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('or', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          or: [{ firstName: { equal: 'BOB' } }, { lastName: { equal: 'FAWCETT' } }],
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('not', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({ not: { firstName: { equal: 'BOB' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (single)', async () => {
        const builder = new FilmDeleteManyBuilder(options).where({ language: { name: { equal: 'English' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (multi)', async () => {
        const builder = new LanguageDeleteManyBuilder(options).where({ films: { title: { equal: 'BEAR GRACELAND' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (through)', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({ films: { title: { equal: 'BEAR GRACELAND' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = new LanguageDeleteManyBuilder(options).where({
          films: { avg: { replacementCost: { greaterThan: 10 } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        // await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = new LanguageDeleteManyBuilder(options).where({
          films: { count: { greaterThan: 1 } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (both field and aggregate)', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          films: { avg: { replacementCost: { greaterThan: 20 } }, title: { equal: 'BEAR GRACELAND' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with nested association', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({
          films: { language: { name: { equal: 'English' } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('merge', async () => {
        const builder = new ActorDeleteManyBuilder(options).where({ firstName: { equal: 'BOB' } }).mergeWhere({
          films: { language: { name: { equal: 'English' } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeNumber()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('orderBy', () => {
      test('with one field', async () => {
        const builder = new ActorDeleteManyBuilder(options).orderBy([{ firstName: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = new ActorDeleteManyBuilder(options).orderBy([])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with multiple fields', async () => {
        const builder = new ActorDeleteManyBuilder(options).orderBy([{ id: 'ASC' }, { lastUpdate: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (field)', async () => {
        const builder = new FilmDeleteManyBuilder(options).orderBy([{ language: { name: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = new LanguageDeleteManyBuilder(options).orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate and through)', async () => {
        const builder = new FilmDeleteManyBuilder(options).orderBy([{ actors: { min: { lastUpdate: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = new ActorDeleteManyBuilder(options).orderBy([{ films: { count: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = new ActorDeleteManyBuilder(options).orderBy([{}])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (missing field)', async () => {
        const builder = new FilmDeleteManyBuilder(options).orderBy([{ originalLanguage: { nam: 'ASC' } as any }])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })

      test('with association (missing aggregate field)', async () => {
        const builder = new LanguageDeleteManyBuilder(options).orderBy([
          { films: { avg: { replacementCostt: 'ASC' } as any } },
        ])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })
    })

    describe('limit', () => {
      test('with number', async () => {
        const builder = new ActorDeleteManyBuilder(options).limit(10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('offset', () => {
      test('with number', async () => {
        const builder = new ActorDeleteManyBuilder(options).offset(20)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        await rollback(builder, result => expect(result).toBeNumber())
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
