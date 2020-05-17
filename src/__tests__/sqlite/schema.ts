import gql from 'graphql-tag'
import { GraphQLDateTime } from 'graphql-scalars'
import { IResolvers } from 'graphql-tools'

import knex from './knex'
import { createSqlmancerClient, makeSqlmancerSchema } from '../..'
import { SqlmancerClient } from './sqlmancer'

const typeDefs = gql`
  scalar DateTime

  type Query @sqlmancer(dialect: SQLITE, transformFieldNames: SNAKE_CASE, customScalars: { Date: ["DateTime"] }) {
    actors: [Actor!]! @many
    actor(id: ID!): Actor
    actorsPaginated: Actor @paginate @many(model: "Actor")
    films: [Film!]! @limit @offset @where @orderBy
    film(id: ID!): Film
    filmsPaginated: Film @paginate @many(model: "Film")
    customers: [Customer!]! @many
    customer(id: ID!): Customer
    addresses: [Address!]! @many
    address(id: ID!): Address
    movies: [Movie!]! @many
    people: [Person!]! @many
  }

  type Mutation {
    createCustomer: Customer @input(action: CREATE)
    createCustomers: [Customer!]! @input(action: CREATE, list: true)
    deleteCustomer(id: ID): Boolean!
    deleteCustomers: Boolean! @where(model: "Customer")
    updateCustomer(id: ID): Customer @input(action: UPDATE)
    updateCustomers: [Customer!]! @where @input(action: UPDATE)

    # This is an example of a mutation with a payload type. See the resolver for implementation details.
    createCustomerWithPayload: CreateCustomerPayload!
  }

  type Actor @model(table: "actor", pk: "actor_id") {
    id: ID! @col(name: "actor_id") @hasDefault
    firstName: String!
    lastName: String!
    lastUpdate: DateTime! @hasDefault
    films: [Film!]!
      @relate(on: [{ from: "actor_id", to: "actor_id" }, { from: "film_id", to: "film_id" }], through: "film_actor")
      @many
    filmsPaginated: Film
      @relate(
        on: [{ from: "actor_id", to: "actor_id" }, { from: "film_id", to: "film_id" }]
        through: "film_actor"
        pagination: OFFSET
      )
      @paginate
      @many(model: "Film")
  }

  type Film @model(table: "film", pk: "film_id") {
    id: ID! @col(name: "film_id") @hasDefault
    title: String!
    description: String!
    releaseYear: Int!
    length: Int!
    rating: FilmRating!
    rentalRate: Float!
    rentalDuration: Int!
    replacementCost: Float!
    lastUpdate: DateTime! @hasDefault
    actors: [Actor!]!
      @relate(on: [{ from: "film_id", to: "film_id" }, { from: "actor_id", to: "actor_id" }], through: "film_actor")
      @many
    categories: [Category!]!
      @relate(
        on: [{ from: "film_id", to: "film_id" }, { from: "category_id", to: "category_id" }]
        through: "film_category"
      )
      @many
    actorsPaginated: Actor
      @relate(
        on: [{ from: "film_id", to: "film_id" }, { from: "actor_id", to: "actor_id" }]
        through: "film_actor"
        pagination: OFFSET
      )
      @paginate
      @many(model: "Actor")
    language: Language! @relate(on: { from: "language_id", to: "language_id" })
    originalLanguage: Language @relate(on: { from: "original_language_id", to: "language_id" })
    sequel: Film @relate(on: { from: "sequel_id", to: "film_id" })
  }

  type Language @model(table: "language", pk: "language_id") {
    id: ID! @col(name: "language_id") @hasDefault
    name: String!
    lastUpdate: DateTime! @hasDefault
    films: [Film!]! @relate(on: { from: "language_id", to: "language_id" }) @many
    filmsPaginated: Film
      @relate(on: { from: "language_id", to: "language_id" }, pagination: OFFSET)
      @paginate
      @many(model: "Film")
  }

  type Customer @model(table: "customer", pk: "customer_id") {
    id: ID! @col(name: "customer_id") @hasDefault
    firstName: String!
    lastName: String!
    email: String
    lastUpdate: DateTime! @hasDefault
  }

  type CreateCustomerPayload {
    customer: Film
    message: String
  }

  # This is an example of a read-only model. The client will not include any create, update or delete
  # methods for this model. This is particularly helpful if you're using a view instead of a table.
  type Category @model(table: "category", pk: "category_id", readOnly: true) {
    id: ID! @col(name: "category_id") @hasDefault
    name: String!
    lastUpdate: DateTime! @hasDefault
    films: [Film!]!
      @relate(
        on: [{ from: "category_id", to: "category_id" }, { from: "film_id", to: "film_id" }]
        through: "film_category"
      )
      @many
  }

  # This is an example of using an "inline" view by providing a common table expression (CTE). Models
  # defined this way are always read-only. You can use CTEs like this to define arbitary views of your
  # underlying database without doing any migrations.
  type Address
    @model(
      pk: "id"
      cte: """
      SELECT
        address.address_id AS id,
        address.address AS address_line,
        address.address2 AS address_line_2,
        address.postal_code AS postal_code,
        city.city AS city,
        country.country AS country,
        address.last_update AS last_update
      FROM address
      INNER JOIN city ON address.city_id = city.city_id
      INNER JOIN country ON city.country_id = country.country_id
      """
    ) {
    id: ID!
    addressLine: String!
    addressLine2: String
    postalCode: String
    city: String!
    country: String!
    lastUpdate: DateTime!
  }

  # This is an example of defining an abstract type using single table inheritance
  interface Movie @model(table: "film", pk: "film_id", include: ["length"]) {
    id: ID!
    title: String!
    description: String!
    releaseYear: Int!
    length: Int!
    rating: FilmRating!
    rentalRate: Float!
    rentalDuration: Int!
    replacementCost: Float!
    lastUpdate: DateTime!
  }

  type ShortMovie implements Movie {
    id: ID! @col(name: "film_id") @hasDefault
    title: String!
    description: String!
    releaseYear: Int!
    length: Int!
    rating: FilmRating!
    rentalRate: Float!
    rentalDuration: Int!
    replacementCost: Float!
    lastUpdate: DateTime! @hasDefault
  }

  type LongMovie implements Movie {
    id: ID! @col(name: "film_id") @hasDefault
    title: String!
    description: String!
    releaseYear: Int!
    length: Int!
    rating: FilmRating!
    rentalRate: Float!
    rentalDuration: Int!
    replacementCost: Float!
    lastUpdate: DateTime! @hasDefault
  }

  # This is an example of using an abstract type with an inline view
  union Person
    @model(
      pk: "customer_id"
      cte: """
      SELECT
        'customer_' || customer_id as customer_id,
        first_name,
        last_name,
        email,
        last_update,
        'Customer' as __typename
      FROM customer
      UNION
      SELECT
        'actor' || actor_id as customer_id,
        first_name,
        last_name,
        NULL as email,
        last_update,
        'Actor' as __typename
      FROM actor
      """
      include: ["__typename"]
    ) =
      Actor
    | Customer

  enum FilmRating {
    G
    PG
    PG13 @value(is: "PG-13")
    R
    NC17 @value(is: "NC-17")
  }
`

export const client = createSqlmancerClient<SqlmancerClient>(__filename, knex)

const { Film, Actor, Customer, Address, Movie, Person } = client.models

const resolvers: IResolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    actors: (_root, _args, _ctx, info) => {
      return Actor.findMany().resolveInfo(info).execute()
    },
    actor: (_root, args, _ctx, info) => {
      return Actor.findById(args.id).resolveInfo(info).execute()
    },
    actorsPaginated: (_root, _args, _ctx, info) => {
      return Actor.paginate().resolveInfo(info).execute()
    },
    films: (_root, _args, _ctx, info) => {
      return Film.findMany().resolveInfo(info).execute()
    },
    film: (_root, args, _ctx, info) => {
      return Film.findById(args.id).resolveInfo(info).execute()
    },
    filmsPaginated: (_root, _args, _ctx, info) => {
      return Film.paginate().resolveInfo(info).execute()
    },
    customers: (_root, _args, _ctx, info) => {
      return Customer.findMany().resolveInfo(info).execute()
    },
    customer: (_root, args, _ctx, info) => {
      return Customer.findById(args.id).resolveInfo(info).execute()
    },
    addresses: (_root, _args, _ctx, info) => {
      return Address.findMany().resolveInfo(info).execute()
    },
    address: (_root, args, _ctx, info) => {
      return Address.findById(args.id).resolveInfo(info).execute()
    },
    movies: (_root, args, _ctx, info) => {
      return Movie.findMany().resolveInfo(info).execute()
    },
    people: (_root, args, _ctx, info) => {
      return Person.findMany().resolveInfo(info).execute()
    },
  },
  Mutation: {
    createCustomer: async (_root, args, _ctx, info) => {
      const id = await Customer.createOne(args.input).execute()
      return Customer.findById(id).resolveInfo(info).execute()
    },
    createCustomers: async (_root, args, _ctx, info) => {
      const ids = await Customer.createMany(args.input).execute()
      return Customer.findMany()
        .resolveInfo(info)
        .where({ id: { in: ids } })
        .execute()
    },
    deleteCustomer: (_root, args) => {
      return Customer.deleteById(args.id).execute()
    },
    deleteCustomers: async (_root, args) => {
      const numberDeleted = await Customer.deleteMany().where(args.where).execute()
      return numberDeleted > 0
    },
    updateCustomer: async (_root, args, _ctx, info) => {
      await Customer.updateById(args.id, args.input).execute()
      return Customer.findById(args.id).resolveInfo(info).execute()
    },
    updateCustomers: async (_root, args, _ctx, info) => {
      await Customer.updateMany(args.input).where(args.where).execute()
      return Customer.findMany().resolveInfo(info).where(args.where).execute()
    },
    createCustomerWithPayload: async (_root, args, _ctx, info) => {
      const id = await Customer.createOne(args.input).execute()
      const customer = await Customer.findById(id).resolveInfo(info, 'customer').execute()
      return { customer }
    },
  },
  Movie: {
    __resolveType: (movie: any) => {
      return movie.length >= 120 ? 'LongMovie' : 'ShortMovie'
    },
  },
  Actor: {
    id: (actor) => (actor.id.replace ? actor.id.replace(/\D/g, '') : actor.id),
  },
  Customer: {
    id: (customer) => (customer.id.replace ? customer.id.replace(/\D/g, '') : customer.id),
  },
}

export const schema = makeSqlmancerSchema({
  typeDefs,
  resolvers,
})
