import { withDialects, mockResolveInfo } from './__utilties__'

describe('FindBuilder', () => {
  withDialects((client, _rollback, schema) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = client.models.Actor.findMany()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('select', () => {
      test('with multiple fields', async () => {
        const builder = client.models.Actor.findMany().select('firstName', 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = client.models.Actor.findMany().select()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with missing field', async () => {
        const builder = client.models.Actor.findMany().select('firstNam' as any, 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('all', async () => {
        const builder = client.models.Actor.findMany().selectAll()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add', async () => {
        const builder = client.models.Actor.findMany()
          .select('firstName', 'lastName')
          .addSelect('id')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add raw', async () => {
        const builder = client.models.Actor.findMany()
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
        const builder = client.models.Actor.findMany().where({ firstName: { equal: 'BOB' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with two field', async () => {
        const builder = client.models.Actor.findOne().where({
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
        const builder = client.models.Actor.findMany().where({
          firstName: { equal: null },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('notEqual null', async () => {
        const builder = client.models.Actor.findMany().where({
          firstName: { notEqual: null },
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with extra operators', async () => {
        const builder = client.models.Actor.findMany().where({ firstName: { equal: 'BOB', notEqual: 'SUSAN' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent field', async () => {
        const builder = client.models.Actor.findMany().where({
          firstNam: { equal: 'BOB' },
        } as any)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = client.models.Actor.findMany().where({})
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('and', async () => {
        const builder = client.models.Actor.findMany().where({
          and: [{ firstName: { equal: 'BOB' } }, { lastName: { equal: 'FAWCETT' } }],
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('or', async () => {
        const builder = client.models.Actor.findMany().where({
          or: [{ firstName: { equal: 'BOB' } }, { lastName: { equal: 'FAWCETT' } }],
        })

        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('not', async () => {
        const builder = client.models.Actor.findMany().where({ not: { firstName: { equal: 'BOB' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (single)', async () => {
        const builder = client.models.Film.findMany().where({ language: { name: { equal: 'English' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (multi)', async () => {
        const builder = client.models.Language.findMany().where({ films: { title: { equal: 'BEAR GRACELAND' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (through)', async () => {
        const builder = client.models.Actor.findMany().where({ films: { title: { equal: 'BEAR GRACELAND' } } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = client.models.Language.findMany().where({
          films: { avg: { replacementCost: { greaterThan: 10 } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = client.models.Language.findMany().where({
          films: { count: { greaterThan: 1 } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (both field and aggregate)', async () => {
        const builder = client.models.Actor.findMany().where({
          films: { avg: { replacementCost: { greaterThan: 20 } }, title: { equal: 'BEAR GRACELAND' } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with nested association', async () => {
        const builder = client.models.Actor.findMany().where({
          films: { language: { name: { equal: 'English' } } },
        })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('merge', async () => {
        const builder = client.models.Actor.findMany()
          .where({ firstName: { equal: 'BOB' } })
          .mergeWhere({
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
        const builder = client.models.Actor.findMany().orderBy([{ firstName: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = client.models.Actor.findMany().orderBy([])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with multiple fields', async () => {
        const builder = client.models.Actor.findMany().orderBy([{ id: 'ASC' }, { lastUpdate: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (field)', async () => {
        const builder = client.models.Film.findMany().orderBy([{ language: { name: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate)', async () => {
        const builder = client.models.Language.findMany().orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (aggregate and through)', async () => {
        const builder = client.models.Film.findMany().orderBy([{ actors: { min: { lastUpdate: 'ASC' } } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (count)', async () => {
        const builder = client.models.Actor.findMany().orderBy([{ films: { count: 'ASC' } }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (single)', async () => {
        const builder = client.models.Film.findOne().load('language', builder => builder.orderBy([{ name: 'ASC' }]))
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (single with aggregate)', async () => {
        const builder = client.models.Film.findOne().load('language', builder =>
          builder.orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (multi)', async () => {
        const builder = client.models.Film.findOne().load('actors', builder => builder.orderBy([{ firstName: 'ASC' }]))
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested (multi with aggregate)', async () => {
        const builder = client.models.Film.findOne().load('actors', builder =>
          builder.orderBy([{ films: { avg: { replacementCost: 'ASC' } } }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with empty object', async () => {
        const builder = client.models.Actor.findMany().orderBy([{}])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with association (missing field)', async () => {
        const builder = client.models.Film.findMany().orderBy([{ originalLanguage: { nam: 'ASC' } as any }])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })

      test('with association (missing aggregate field)', async () => {
        const builder = client.models.Language.findMany().orderBy([
          { films: { avg: { replacementCostt: 'ASC' } as any } },
        ])
        expect(() => builder.toQueryBuilder()).toThrow('Invalid field name')
      })
    })

    describe('limit', () => {
      test('with number', async () => {
        const builder = client.models.Actor.findMany().limit(10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('offset', () => {
      test('with number', async () => {
        const builder = client.models.Actor.findMany().offset(20)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('load', () => {
      test('with FK on builder table', async () => {
        const builder = client.models.Film.findMany().load('language', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with FK on joined table', async () => {
        const builder = client.models.Language.findMany().load('films', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with junction table', async () => {
        const builder = client.models.Film.findMany().load('actors', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with additional options', async () => {
        const builder = client.models.Film.findMany().load('actors', builder =>
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
        const builder = client.models.Film.findMany().load('actors', 'performers', builder => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with default builder', async () => {
        const builder = client.models.Film.findMany().load('actors')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested', async () => {
        const builder = client.models.Film.findOne().load('actors', builder =>
          builder.limit(3).load('films', builder => builder.limit(4).load('language', builder => builder))
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent association', async () => {
        expect(() => client.models.Film.findMany().load('actor' as any)).toThrow('Invalid association name')
      })
    })

    describe('loadAggregate', () => {
      test('with FK on builder table', async () => {
        const builder = client.models.Film.findMany().loadAggregate('language', 'languageAggregate', builder =>
          builder.max('name')
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with FK on joined table', async () => {
        const builder = client.models.Language.findMany().loadAggregate('films', 'filmsAggregate', builder =>
          builder.max('rentalRate')
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with junction table', async () => {
        const builder = client.models.Actor.findMany().loadAggregate('films', 'filmsAggregate', builder =>
          builder.max('rentalRate')
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with additional options', async () => {
        const builder = client.models.Actor.findMany().loadAggregate('films', 'filmsAggregate', builder =>
          builder
            .max('rentalRate')
            .limit(2)
            .offset(1)
            .orderBy([{ title: 'DESC' }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
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
        const builder = client.models.Film.findMany().resolveInfo(info)
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
        const builder = client.models.Film.findMany().resolveInfo(info)
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
        const builder = client.models.Actor.findMany().resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('query with nested aggregate', async () => {
        const query = `{
          actors {
            id
            firstName
            lastName
            filmsAggregate(
              where: { title: { equal: "Title" } }
              orderBy: { releaseYear: DESC }
              limit: 10
              offset: 3
            ) {
              count
              max {
                title
                releaseYear
              }
              min {
                title
                releaseYear
              }
              avg {
                rentalRate
                replacementCost
              }
              sum {
                rentalRate
                replacementCost
              }
            }
          }
        }`
        const info = await mockResolveInfo(schema, 'Query', 'actors', query)
        const builder = client.models.Actor.findMany().resolveInfo(info)
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
        const builder = client.models.Actor.findMany().resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeArray()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('valid path', async () => {
        const query = `mutation {
          createCustomerWithPayload {
            customer {
              id
              email
            }
          }
        }`
        const info = await mockResolveInfo(schema, 'Mutation', 'createCustomerWithPayload', query)
        const builder = client.models.Customer.findOne().resolveInfo(info, 'customer')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('transaction', () => {
      test('with transaction', async () => {
        await client.transaction(async trx => {
          const result = await client.models.Actor.findMany()
            .transaction(trx)
            .execute()
          expect(result).toBeArray()
        })
      })
    })
  })
})
