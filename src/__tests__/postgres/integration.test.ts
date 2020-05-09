/* eslint-disable no-useless-escape */
import { graphql, validateSchema } from 'graphql'
import { schema, client } from './schema'

describe('integration (postgres)', () => {
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
          specialFeatures
          extraData
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
          d: films(where: { id: { notIn: [99] } }) {
            title
          }
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
          i: films(where: { title: { iLike: "foo%" } }) {
            title
          }
          j: films(where: { title: { notILike: "%a%" } }) {
            title
          }
          k: films(where: { extraData: { hasKey: "foo" } }) {
            title
          }
          l: films(where: { extraData: { hasAnyKeys: ["foo"] } }) {
            title
          }
          m: films(where: { extraData: { hasAllKeys: ["foo"] } }) {
            title
          }
          n: films(where: { extraData: { contains: "{\\"foo\\": 42}" } }) {
            title
          }
          o: films(where: { extraData: { containedBy: "{\\"foo\\": 42}" } }) {
            title
          }
          p: films(where: { specialFeatures: { contains: ["foo"] } }) {
            title
          }
          q: films(where: { specialFeatures: { containedBy: ["foo"] } }) {
            title
          }
          r: films(where: { specialFeatures: { overlaps: ["foo"] } }) {
            title
          }
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data?.a).toHaveLength(1)
    expect(data?.a[0].title).toBe('BOOGIE AMELIE')
  })

  test('aggregation', async () => {
    const { data, errors } = await graphql(
      schema,
      `
        query {
          actorsAggregate {
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
          filmsAggregate {
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
          actor(id: 1) {
            filmsAggregate {
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
          }
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data?.actorsAggregate.count).toBeGreaterThan(0)
    expect(data?.actorsAggregate.min.firstName).toBeDefined()
    expect(data?.actorsAggregate.min.lastUpdate).toBeDefined()
    expect(data?.actorsAggregate.max.lastName).toBeDefined()
    expect(data?.actorsAggregate.max.lastUpdate).toBeDefined()
    expect(data?.filmsAggregate.count).toBeGreaterThan(0)
    expect(data?.filmsAggregate.min.title).toBeDefined()
    expect(data?.filmsAggregate.min.length).toBeDefined()
    expect(data?.filmsAggregate.min.lastUpdate).toBeDefined()
    expect(data?.filmsAggregate.max.title).toBeDefined()
    expect(data?.filmsAggregate.max.length).toBeDefined()
    expect(data?.filmsAggregate.max.lastUpdate).toBeDefined()
    expect(data?.filmsAggregate.avg.length).toBeDefined()
    expect(data?.filmsAggregate.sum.length).toBeDefined()
    expect(data?.actor.filmsAggregate.count).toBeGreaterThan(0)
    expect(data?.actor.filmsAggregate.min.title).toBeDefined()
    expect(data?.actor.filmsAggregate.min.length).toBeDefined()
    expect(data?.actor.filmsAggregate.min.lastUpdate).toBeDefined()
    expect(data?.actor.filmsAggregate.max.title).toBeDefined()
    expect(data?.actor.filmsAggregate.max.length).toBeDefined()
    expect(data?.actor.filmsAggregate.max.lastUpdate).toBeDefined()
    expect(data?.actor.filmsAggregate.avg.length).toBeDefined()
    expect(data?.actor.filmsAggregate.sum.length).toBeDefined()
  })
})
