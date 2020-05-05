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
    const { data, errors } = await graphql<any>(
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
    expect(data.films.length).toBeGreaterThan(0)
    expect(data.film).toBeObject()
    expect(data.film.language).toBeObject()
    expect(data.film.actors.length).toBeGreaterThan(0)
    expect(data.film.categories.length).toBeGreaterThan(0)
    expect(data.actors.length).toBeGreaterThan(0)
    expect(data.actor).toBeObject()
    expect(data.actor.films.length).toBeGreaterThan(0)
    expect(data.actor.films[0].language).toBeObject()
    expect(data.customers.length).toBeGreaterThan(0)
    expect(data.customer).toBeObject()
    expect(data.addresses.length).toBeGreaterThan(0)
    expect(data.address).toBeObject()
  })

  test('sorting and filtering', async () => {
    const { data, errors } = await graphql<any>(
      schema,
      `
        query {
          films(limit: 3, offset: 1, orderBy: { id: DESC }, where: { title: { like: "BOO%" } }) {
            id
            title
          }
        }
      `
    )
    expect(errors).toBeUndefined()
    expect(data.films).toHaveLength(1)
    expect(data.films[0].title).toBe('BOOGIE AMELIE')
  })

  test('aggregation', async () => {
    const { data, errors } = await graphql<any>(
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
    expect(data.actorsAggregate.count).toBeGreaterThan(0)
    expect(data.actorsAggregate.min.firstName).toBeDefined()
    expect(data.actorsAggregate.min.lastUpdate).toBeDefined()
    expect(data.actorsAggregate.max.lastName).toBeDefined()
    expect(data.actorsAggregate.max.lastUpdate).toBeDefined()
    expect(data.filmsAggregate.count).toBeGreaterThan(0)
    expect(data.filmsAggregate.min.title).toBeDefined()
    expect(data.filmsAggregate.min.length).toBeDefined()
    expect(data.filmsAggregate.min.lastUpdate).toBeDefined()
    expect(data.filmsAggregate.max.title).toBeDefined()
    expect(data.filmsAggregate.max.length).toBeDefined()
    expect(data.filmsAggregate.max.lastUpdate).toBeDefined()
    expect(data.filmsAggregate.avg.length).toBeDefined()
    expect(data.filmsAggregate.sum.length).toBeDefined()
    expect(data.actor.filmsAggregate.count).toBeGreaterThan(0)
    expect(data.actor.filmsAggregate.min.title).toBeDefined()
    expect(data.actor.filmsAggregate.min.length).toBeDefined()
    expect(data.actor.filmsAggregate.min.lastUpdate).toBeDefined()
    expect(data.actor.filmsAggregate.max.title).toBeDefined()
    expect(data.actor.filmsAggregate.max.length).toBeDefined()
    expect(data.actor.filmsAggregate.max.lastUpdate).toBeDefined()
    expect(data.actor.filmsAggregate.avg.length).toBeDefined()
    expect(data.actor.filmsAggregate.sum.length).toBeDefined()
  })
})
