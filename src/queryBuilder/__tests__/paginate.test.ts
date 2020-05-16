import { withDialects } from '../../__tests__/utilities'

describe('PaginateBuilder', () => {
  withDialects((client) => {
    describe('aggregate', () => {
      test('count', async () => {
        const builder = client.models.Film.paginate().count()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.count).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('avg', async () => {
        const builder = client.models.Film.paginate().avg('rentalRate')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.avg.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('sum', async () => {
        const builder = client.models.Film.paginate().sum('replacementCost')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.sum.replacementCost).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('min', async () => {
        const builder = client.models.Film.paginate().min('title')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.min.title).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('max', async () => {
        const builder = client.models.Film.paginate().max('title')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.max.title).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('multiple functions', async () => {
        const builder = client.models.Film.paginate().max('title').max('description').count().avg('rentalDuration')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.max.title).toBeDefined()
        expect(result.aggregate.max.description).toBeDefined()
        expect(result.aggregate.avg.rentalDuration).toBeDefined()
        expect(result.aggregate.count).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('where', async () => {
        const builder = client.models.Film.paginate()
          .sum('rentalRate')
          .where({ title: { equal: 'FILM' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('mergeWhere', async () => {
        const builder = client.models.Film.paginate()
          .sum('rentalRate')
          .where({ title: { equal: 'FILM' } })
          .mergeWhere({
            description: { equal: 'description' },
          })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('orderBy', async () => {
        const builder = client.models.Film.paginate()
          .sum('rentalRate')
          .orderBy([{ title: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('limit', async () => {
        const builder = client.models.Film.paginate().sum('rentalRate').limit(10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('offset', async () => {
        const builder = client.models.Film.paginate().sum('rentalRate').offset(20)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.aggregate.sum.rentalRate).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('results', () => {
      test('select', async () => {
        const builder = client.models.Film.paginate().select('title', 'description')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results[0].title).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('selectAll', async () => {
        const builder = client.models.Film.paginate().selectAll()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results[0].title).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('load', async () => {
        const builder = client.models.Film.paginate().load('actors', 'credits')
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results[0].credits[0].id).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('loadPaginated', async () => {
        const builder = client.models.Film.paginate().loadPaginated('actors', (builder) => builder.count())
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results[0].actors.aggregate.count).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('where', async () => {
        const builder = client.models.Film.paginate()
          .select('title')
          .where({ title: { equal: 'FILM' } })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('mergeWhere', async () => {
        const builder = client.models.Film.paginate()
          .select('title')
          .where({ title: { equal: 'FILM' } })
          .mergeWhere({
            description: { equal: 'description' },
          })
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('orderBy', async () => {
        const builder = client.models.Film.paginate()
          .select('title')
          .orderBy([{ title: 'ASC' }])
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('limit', async () => {
        const builder = client.models.Film.paginate().select('title').limit(10)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('offset', async () => {
        const builder = client.models.Film.paginate().select('title').offset(20)
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.results).toBeDefined()
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('hasMore', () => {
      test('limit', async () => {
        const builder = client.models.Film.paginate().select('title').limit(5).hasMore()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.hasMore).toBeOneOf([true, 1])
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })

      test('no limit', async () => {
        const builder = client.models.Film.paginate().select('title').hasMore()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        expect(result.hasMore).toBeOneOf([false, 0])
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })

    describe('totalCount', () => {
      test('correct usage', async () => {
        const builder = client.models.Film.paginate().totalCount()
        const builder2 = client.models.Film.paginate().offset(10).totalCount()
        const builder3 = client.models.Film.paginate().limit(10).totalCount()
        const { sql, bindings } = builder.toQueryBuilder().toSQL()
        const result = await builder.execute()
        const result2 = await builder2.execute()
        const result3 = await builder3.execute()
        expect(result.totalCount).toBeNumber()
        expect(result.totalCount).toBe(result2.totalCount)
        expect(result.totalCount).toBe(result3.totalCount)
        expect(sql).toMatchSnapshot()
        expect(bindings).toMatchSnapshot()
      })
    })
  })
})
