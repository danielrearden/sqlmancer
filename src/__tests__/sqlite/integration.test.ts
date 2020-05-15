import { graphql, validateSchema } from 'graphql'
import { schema, client } from './schema'

describe('integration (sqlite)', () => {
  afterAll(async () => {
    await client.destroy()
  })

  test('valid schema', async () => {
    const errors = validateSchema(schema)
    expect(errors).toHaveLength(0)
  })

  test('basic queries', async () => {
    const { data, errors } = await graphql(
      schema,
      `
        query {
          films {
            ...FilmFields
          }
          film(id: 1) {
            ...FilmFields
          }
          actors {
            ...ActorFields
          }
          actor(id: 1) {
            ...ActorFields
          }
          customers {
            ...CustomerFields
          }
          customer(id: 1) {
            ...CustomerFields
          }
          addresses {
            ...AddressFields
          }
          address(id: 1) {
            ...AddressFields
          }
        }

        fragment FilmFields on Film {
          id
          title
          description
          releaseYear
          length
          rating
          rentalRate
          rentalDuration
          replacementCost
          lastUpdate
          actors {
            id
            firstName
            lastName
          }
          categories {
            id
            name
          }
          language {
            id
            name
          }
        }

        fragment ActorFields on Actor {
          id
          firstName
          lastName
          lastUpdate
          films {
            id
            title
            language {
              id
              name
            }
          }
        }

        fragment CustomerFields on Customer {
          id
          firstName
          lastName
          email
          lastUpdate
        }

        fragment AddressFields on Address {
          id
          addressLine
          addressLine2
          postalCode
          city
          country
          lastUpdate
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data?.films.length).toBeGreaterThan(0)
    expect(data?.film).toBeObject()
    expect(data?.film.language).toBeObject()
    expect(data?.film.actors.length).toBeGreaterThan(0)
    expect(data?.film.categories.length).toBeGreaterThan(0)
    expect(data?.actors.length).toBeGreaterThan(0)
    expect(data?.actor).toBeObject()
    expect(data?.actor.films.length).toBeGreaterThan(0)
    expect(data?.actor.films[0].language).toBeObject()
    expect(data?.customers.length).toBeGreaterThan(0)
    expect(data?.customer).toBeObject()
    expect(data?.addresses.length).toBeGreaterThan(0)
    expect(data?.address).toBeObject()
  })

  test('sorting and filtering', async () => {
    const { data, errors } = await graphql(
      schema,
      `
        query {
          a: films(limit: 3, offset: 1, orderBy: { id: DESC }, where: { title: { like: "BOO%" } }) {
            title
          }
          b: films(where: { id: { equal: 99 } }) {
            title
          }
          c: films(where: { id: { in: [99] } }) {
            title
          }
          #d: films(where: { id: { notIn: [99] } }) {
          #  title
          #}
          e: films(where: { length: { greaterThan: 120 } }) {
            title
          }
          f: films(where: { lastUpdate: { lessThanOrEqual: "1987-07-22T03:15:30.000Z" } }) {
            title
          }
          g: films(where: { title: { like: "FOO%" } }) {
            title
          }
          h: films(where: { title: { notLike: "%A%" } }) {
            title
          }
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data?.a).toHaveLength(1)
    expect(data?.a[0].title).toBe('BOOGIE AMELIE')
  })

  test('nested sorting and filtering', async () => {
    const { data, errors } = await graphql(
      schema,
      `
        query {
          actors(limit: 5) {
            films(limit: 3, offset: 1, orderBy: { id: DESC }, where: { title: { like: "%" } }) {
              title
            }
          }
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data?.actors[0].films[0]).toBeDefined()
  })

  test('pagination', async () => {
    const { data, errors } = await graphql(
      schema,
      `
        query {
          actorsPaginated {
            aggregate {
              count
              min {
                firstName
                lastUpdate
              }
              max {
                lastName
                lastUpdate
              }
            }
            results {
              id
            }
            hasMore
          }
          filmsPaginated {
            aggregate {
              count
              min {
                title
                length
                lastUpdate
              }
              max {
                title
                length
                lastUpdate
              }
              avg {
                length
              }
              sum {
                length
              }
            }
            results {
              id
            }
            hasMore
          }
          actor(id: 1) {
            filmsPaginated {
              aggregate {
                count
                min {
                  title
                  length
                  lastUpdate
                }
                max {
                  title
                  length
                  lastUpdate
                }
                avg {
                  length
                }
                sum {
                  length
                }
              }
              results {
                id
              }
              hasMore
            }
          }
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data?.actorsPaginated.aggregate.count).toBeGreaterThan(0)
    expect(data?.actorsPaginated.aggregate.min.firstName).toBeDefined()
    expect(data?.actorsPaginated.aggregate.min.lastUpdate).toBeDefined()
    expect(data?.actorsPaginated.aggregate.max.lastName).toBeDefined()
    expect(data?.actorsPaginated.aggregate.max.lastUpdate).toBeDefined()
    expect(data?.actorsPaginated.results.length).toBeGreaterThan(0)
    expect(data?.actorsPaginated.hasMore).toBeDefined()
    expect(data?.filmsPaginated.aggregate.count).toBeGreaterThan(0)
    expect(data?.filmsPaginated.aggregate.min.title).toBeDefined()
    expect(data?.filmsPaginated.aggregate.min.length).toBeDefined()
    expect(data?.filmsPaginated.aggregate.min.lastUpdate).toBeDefined()
    expect(data?.filmsPaginated.aggregate.max.title).toBeDefined()
    expect(data?.filmsPaginated.aggregate.max.length).toBeDefined()
    expect(data?.filmsPaginated.aggregate.max.lastUpdate).toBeDefined()
    expect(data?.filmsPaginated.aggregate.avg.length).toBeDefined()
    expect(data?.filmsPaginated.aggregate.sum.length).toBeDefined()
    expect(data?.filmsPaginated.results.length).toBeGreaterThan(0)
    expect(data?.filmsPaginated.hasMore).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.count).toBeGreaterThan(0)
    expect(data?.actor.filmsPaginated.aggregate.min.title).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.min.length).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.min.lastUpdate).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.max.title).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.max.length).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.max.lastUpdate).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.avg.length).toBeDefined()
    expect(data?.actor.filmsPaginated.aggregate.sum.length).toBeDefined()
    expect(data?.actor.filmsPaginated.results.length).toBeGreaterThan(0)
    expect(data?.actor.filmsPaginated.hasMore).toBeDefined()
  })

  test('abstract types', async () => {
    const { data, errors } = await graphql(
      schema,
      `
        query {
          movies {
            __typename
            id
            title
          }
          people {
            __typename
            ... on Actor {
              id
              firstName
              lastName
            }
            ... on Customer {
              id
              firstName
              lastName
            }
          }
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data?.movies.filter((m: any) => m.__typename === 'ShortMovie').length).toBeGreaterThan(0)
    expect(data?.movies.filter((m: any) => m.__typename === 'LongMovie').length).toBeGreaterThan(0)
    expect(data?.people.filter((p: any) => p.__typename === 'Actor').length).toBeGreaterThan(0)
    expect(data?.people.filter((p: any) => p.__typename === 'Customer').length).toBeGreaterThan(0)
  })
})
