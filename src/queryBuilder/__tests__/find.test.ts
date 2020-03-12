import { withDialects, mockResolveInfo } from './__utilties__'
import { schema } from './__fixtures__/schema'
import {
  ActorFindManyBuilder,
  ActorFindOneBuilder,
  FilmFindManyBuilder,
  FilmFindOneBuilder,
  LanguageFindManyBuilder,
} from './__fixtures__/models'

describe('FindBuilder', () => {
  withDialects(options => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = new ActorFindManyBuilder(options)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('select', () => {
      test('with multiple fields', async () => {
        const builder = new ActorFindManyBuilder(options).select('firstName', 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = new ActorFindManyBuilder(options).select()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with missing field', async () => {
        const builder = new ActorFindManyBuilder(options).select('firstNam' as any, 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('all', async () => {
        const builder = new ActorFindManyBuilder(options).selectAll()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add', async () => {
        const builder = new ActorFindManyBuilder(options).select('firstName', 'lastName').addSelect('id')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add raw', async () => {
        const builder = new ActorFindManyBuilder(options)
          .select('firstName')
          .addSelectRaw('first_name')
          .addSelectRaw('first_name', 'first_name_again')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('where', () => {
      test('with one field', async () => {
        const builder = new ActorFindManyBuilder(options).where({ firstName: { equal: 'BOB' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with two field', async () => {
        const builder = new ActorFindOneBuilder(options).where({
          firstName: { equal: 'BOB' },
          lastName: { equal: 'GOODALL' },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeNull()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('equals null', async () => {
        const builder = new ActorFindManyBuilder(options).where({
          firstName: { equal: null },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('notEqual null', async () => {
        const builder = new ActorFindManyBuilder(options).where({
          firstName: { notEqual: null },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with extra operators', async () => {
        const builder = new ActorFindManyBuilder(options).where({ firstName: { equal: 'BOB', notEqual: 'SUSAN' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent field', async () => {
        const builder = new ActorFindManyBuilder(options).where({
          firstNam: { equal: 'BOB' },
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = new ActorFindManyBuilder(options).where({})
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('and', async () => {
        const builder = new ActorFindManyBuilder(options).where({
          and: [{ firstName: { equal: 'BOB' } }, { lastName: { equal: 'FAWCETT' } }],
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('or', async () => {
        const builder = new ActorFindManyBuilder(options).where({
          or: [{ firstName: { equal: 'BOB' } }, { lastName: { equal: 'FAWCETT' } }],
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('not', async () => {
        const builder = new ActorFindManyBuilder(options).where({ not: { firstName: { equal: 'BOB' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (single)', async () => {
        const builder = new FilmFindManyBuilder(options).where({ language: { name: { equal: 'English' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (multi)', async () => {
        const builder = new LanguageFindManyBuilder(options).where({ films: { title: { equal: 'BEAR GRACELAND' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (through)', async () => {
        const builder = new ActorFindManyBuilder(options).where({ films: { title: { equal: 'BEAR GRACELAND' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = new LanguageFindManyBuilder(options).where({
          films: { avg: { replacementCost: { greaterThan: 10 } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = new LanguageFindManyBuilder(options).where({
          films: { count: { greaterThan: 1 } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (both field and aggregate)', async () => {
        const builder = new ActorFindManyBuilder(options).where({
          films: { avg: { replacementCost: { greaterThan: 20 } }, title: { equal: 'BEAR GRACELAND' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with nested association', async () => {
        const builder = new ActorFindManyBuilder(options).where({
          films: { language: { name: { equal: 'English' } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('merge', async () => {
        const builder = new ActorFindManyBuilder(options).where({ firstName: { equal: 'BOB' } }).mergeWhere({
          films: { language: { name: { equal: 'English' } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('orderBy', () => {
      test('with one field', async () => {
        const builder = new ActorFindManyBuilder(options).orderBy([{ firstName: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = new ActorFindManyBuilder(options).orderBy([])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with multiple fields', async () => {
        const builder = new ActorFindManyBuilder(options).orderBy([{ id: 'ASC' }, { lastUpdate: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (field)', async () => {
        const builder = new FilmFindManyBuilder(options).orderBy([{ language: { name: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = new LanguageFindManyBuilder(options).orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate and through)', async () => {
        const builder = new FilmFindManyBuilder(options).orderBy([{ actors: { min: { lastUpdate: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = new ActorFindManyBuilder(options).orderBy([{ films: { count: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (single)', async () => {
        const builder = new FilmFindOneBuilder(options).join('language', builder => builder.orderBy([{ name: 'ASC' }]))
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (single with aggregate)', async () => {
        const builder = new FilmFindOneBuilder(options).join('language', builder =>
          builder.orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (multi)', async () => {
        const builder = new FilmFindOneBuilder(options).join('actors', builder =>
          builder.orderBy([{ firstName: 'ASC' }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (multi with aggregate)', async () => {
        const builder = new FilmFindOneBuilder(options).join('actors', builder =>
          builder.orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = new ActorFindManyBuilder(options).orderBy([{}])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (missing field)', async () => {
        const builder = new FilmFindManyBuilder(options).orderBy([{ originalLanguage: { nam: 'ASC' } as any }])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })

      test('with association (missing aggregate field)', async () => {
        const builder = new LanguageFindManyBuilder(options).orderBy([
          { films: { avg: { replacementCostt: 'ASC' } as any } },
        ])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })
    })

    describe('limit', () => {
      test('with number', async () => {
        const builder = new ActorFindManyBuilder(options).limit(10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('offset', () => {
      test('with number', async () => {
        const builder = new ActorFindManyBuilder(options).offset(20)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('join', () => {
      test('with FK on builder table', async () => {
        const builder = new FilmFindManyBuilder(options).join('language', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with FK on joined table', async () => {
        const builder = new LanguageFindManyBuilder(options).join('films', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with junction table', async () => {
        const builder = new FilmFindManyBuilder(options).join('actors', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with additional options', async () => {
        const builder = new FilmFindManyBuilder(options).join('actors', builder =>
          builder
            .limit(2)
            .offset(1)
            .select('firstName')
            .orderBy([{ firstName: 'DESC' }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with alias', async () => {
        const builder = new FilmFindManyBuilder(options).join('actors', 'performers', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with default builder', async () => {
        const builder = new FilmFindManyBuilder(options).join('actors')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested', async () => {
        const builder = new FilmFindOneBuilder(options).join('actors', builder =>
          builder.limit(3).join('films', builder => builder.limit(4).join('language', builder => builder))
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent association', async () => {
        expect(() => new FilmFindManyBuilder(options).join('actor' as any)).toThrow('Invalid association name')

        new ActorFindOneBuilder(options)
          .select('id', 'firstName')
          .join('films', builder =>
            builder.join('actors', builder =>
              builder.join('films', 'movies', builder => builder.join('language', 'lang'))
            )
          )
          .execute()
          .then(actor => {
            actor?.films.map(film => film.actors.map(a => a.movies.map(m => m.lang?.lastUpdate)))
          })
      })
    })

    describe('resolveInfo', () => {
      test('basic query', async () => {
        const query = `{
          films {
            id
            title
          }
        }`
        const info = await mockResolveInfo(schema, 'Query', 'films', query)
        const builder = new FilmFindManyBuilder(options).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('query with arguments', async () => {
        const query = `{
          films(
            where: { title: { equal: "Title" } }
            orderBy: { releaseYear: DESC }
            limit: 10
            offset: 3
          ) {
            id
            title
          }
        }`
        const info = await mockResolveInfo(schema, 'Query', 'films', query)
        const builder = new FilmFindManyBuilder(options).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('query with nested arguments', async () => {
        const query = `{
          actors {
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
        const info = await mockResolveInfo(schema, 'Query', 'actors', query)
        const builder = new ActorFindManyBuilder(options).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('query with alias', async () => {
        const query = `{
          actors {
            id
            firstName
            lastName
            movies: films {
              id
              title
            }
          }
        }`
        const info = await mockResolveInfo(schema, 'Query', 'actors', query)
        const builder = new ActorFindManyBuilder(options).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('transaction', () => {
      test('with transaction', async () => {
        await options.knex.transaction(async trx => {
          const result = await new ActorFindManyBuilder(options).transaction(trx).execute()
          expect(result).toBeArray()
        })
      })
    })
  })
})
