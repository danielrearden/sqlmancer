import { withDialects, mockResolveInfo } from './__utilties__'
import { schema } from './__fixtures__/schema'
import { ActorFindByIdBuilder, FilmFindByIdBuilder, LanguageFindByIdBuilder } from './__fixtures__/models'

describe('FindByIdBuilder', () => {
  withDialects(options => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = new ActorFindByIdBuilder(options, 10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('select', () => {
      test('with multiple fields', async () => {
        const builder = new ActorFindByIdBuilder(options, 10).select('firstName', 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = new ActorFindByIdBuilder(options, 10).select()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with missing field', async () => {
        const builder = new ActorFindByIdBuilder(options, 10).select('firstNam' as any, 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('all', async () => {
        const builder = new ActorFindByIdBuilder(options, 10).selectAll()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add', async () => {
        const builder = new ActorFindByIdBuilder(options, 10).select('firstName', 'lastName').addSelect('id')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add raw', async () => {
        const builder = new ActorFindByIdBuilder(options, 10)
          .select('firstName')
          .addSelectRaw('first_name')
          .addSelectRaw('first_name', 'first_name_again')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('join', () => {
      test('with FK on builder table', async () => {
        const builder = new FilmFindByIdBuilder(options, 10).join('language', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with FK on joined table', async () => {
        const builder = new LanguageFindByIdBuilder(options, 5).join('films', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with junction table', async () => {
        const builder = new FilmFindByIdBuilder(options, 10).join('actors', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with additional options', async () => {
        const builder = new FilmFindByIdBuilder(options, 10).join('actors', builder =>
          builder
            .limit(2)
            .offset(1)
            .select('firstName')
            .orderBy([{ firstName: 'DESC' }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with alias', async () => {
        const builder = new FilmFindByIdBuilder(options, 10).join('actors', 'performers', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with default builder', async () => {
        const builder = new FilmFindByIdBuilder(options, 10).join('actors')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested', async () => {
        const builder = new FilmFindByIdBuilder(options, 10).join('actors', builder =>
          builder.limit(3).join('films', builder => builder.limit(4).join('language', builder => builder))
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent association', async () => {
        expect(() => new FilmFindByIdBuilder(options, 10).join('actor' as any)).toThrow('Invalid association name')
      })
    })

    describe('resolveInfo', () => {
      test('basic query', async () => {
        const query = `{
          actor(id: 10) {
            id
            title
          }
        }`
        const info = await mockResolveInfo(schema, 'Query', 'actor', query)
        const builder = new ActorFindByIdBuilder(options, 10).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('query with nested arguments', async () => {
        const query = `{
          actor(id: 10) {
            id
            firstName
            lastName
            films(
              where: { title: { equal: "Title" } }
              orderBy: { releaseYear: DESC }
              limit: 10
              offset: 3
            ) {
              id
              title
            }
          }
        }`
        const info = await mockResolveInfo(schema, 'Query', 'actor', query)
        const builder = new ActorFindByIdBuilder(options, 10).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('query with alias', async () => {
        const query = `{
          actor(id: 10) {
            id
            firstName
            lastName
            movies: films {
              id
              title
            }
          }
        }`
        const info = await mockResolveInfo(schema, 'Query', 'actor', query)
        const builder = new ActorFindByIdBuilder(options, 10).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('valid path', async () => {
        const query = `mutation {
          createFilm {
            film {
              id
              title
            }
          }
        }`
        const info = await mockResolveInfo(schema, 'Mutation', 'createFilm', query)
        const builder = new FilmFindByIdBuilder(options, 10).resolveInfo(info, 'film')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('invalid path', async () => {
        const query = `mutation {
          createFilm {
            film {
              id
              title
            }
          }
        }`
        const info = await mockResolveInfo(schema, 'Mutation', 'createFilm', query)
        expect(() => new FilmFindByIdBuilder(options, 10).resolveInfo(info, 'foo')).toThrow('Invalid path')
      })
    })

    describe('transaction', () => {
      test('with transaction', async () => {
        await options.knex.transaction(async trx => {
          const result = await new ActorFindByIdBuilder(options, 10).transaction(trx).execute()
          expect(result).toBeObject()
        })
      })
    })
  })
})
