import { withDialects, mockResolveInfo } from './__utilties__'

describe('FindByIdBuilder', () => {
  withDialects((client, _rollback, schema) => {
    describe('basic queries', () => {
      test('no additional options', async () => {
        const builder = client.models.Actor.findById(10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('select', () => {
      test('with multiple fields', async () => {
        const builder = client.models.Actor.findById(10).select('firstName', 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with no fields', async () => {
        const builder = client.models.Actor.findById(10).select()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with missing field', async () => {
        const builder = client.models.Actor.findById(10).select('firstNam' as any, 'lastName')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('all', async () => {
        const builder = client.models.Actor.findById(10).selectAll()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add', async () => {
        const builder = client.models.Actor.findById(10).select('firstName', 'lastName').addSelect('id')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('add raw', async () => {
        const builder = client.models.Actor.findById(10)
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

    describe('load', () => {
      test('with FK on builder table', async () => {
        const builder = client.models.Film.findById(10).load('language', (builder) => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with FK on joined table', async () => {
        const builder = client.models.Language.findById(5).load('films', (builder) => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with junction table', async () => {
        const builder = client.models.Film.findById(10).load('actors', (builder) => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with additional options', async () => {
        const builder = client.models.Film.findById(10).load('actors', (builder) =>
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
        const builder = client.models.Film.findById(10).load('actors', 'performers', (builder) => builder)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with default builder', async () => {
        const builder = client.models.Film.findById(10).load('actors')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('nested', async () => {
        const builder = client.models.Film.findById(10).load('actors', (builder) =>
          builder.limit(3).load('films', (builder) => builder.limit(4).load('language', (builder) => builder))
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with non-existent association', async () => {
        expect(() => client.models.Film.findById(10).load('actor' as any)).toThrow('Invalid association name')
      })
    })

    describe('loadAggregate', () => {
      test('with FK on builder table', async () => {
        const builder = client.models.Film.findById(10).loadAggregate('language', 'languageAggregate', (builder) =>
          builder.max('name')
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with FK on joined table', async () => {
        const builder = client.models.Language.findById(1).loadAggregate('films', 'filmsAggregate', (builder) =>
          builder.max('rentalRate')
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with junction table', async () => {
        const builder = client.models.Actor.findById(10).loadAggregate('films', 'filmsAggregate', (builder) =>
          builder.max('rentalRate')
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('with additional options', async () => {
        const builder = client.models.Actor.findById(10).loadAggregate('films', 'filmsAggregate', (builder) =>
          builder
            .max('rentalRate')
            .limit(2)
            .offset(1)
            .orderBy([{ title: 'DESC' }])
        )
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
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
        const builder = client.models.Actor.findById(10).resolveInfo(info)
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
        const builder = client.models.Actor.findById(10).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('query with nested aggregate', async () => {
        const query = `{
          actor(id: 10) {
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
        const info = await mockResolveInfo(schema, 'Query', 'actor', query)
        const builder = client.models.Actor.findById(10).resolveInfo(info)
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
        const builder = client.models.Actor.findById(10).resolveInfo(info)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
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
        const builder = client.models.Customer.findById(10).resolveInfo(info, 'customer')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result).toBeObject()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('transaction', () => {
      test('with transaction', async () => {
        await client.transaction(async (trx) => {
          const result = await client.models.Actor.findById(10).transaction(trx).execute()
          expect(result).toBeObject()
        })
      })
    })
  })
})
