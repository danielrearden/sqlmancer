import gql from 'graphql-tag'
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-type-json'
import { makeSqlmancerSchema } from '../..'

const typeDefs = gql`
  scalar JSON
  scalar JSONObject

  type Query
    @sqlmancer(dialect: MYSQL, transformFieldNames: SNAKE_CASE, customScalars: { JSON: ["JSON", "JSONObject"] }) {
    actors: [Actor!]! @many
    actor(id: ID!): Actor
    films: [Film!]! @many
    film(id: ID!): Film
  }

  type Mutation {
    createFilm: CreateFilmPayload!
  }

  type CreateFilmPayload {
    film: Film
  }

  type Actor @model(table: "actor", pk: "actor_id") {
    id: ID! @col(name: "actor_id") @hasDefault
    firstName: String!
    lastName: String!
    lastUpdate: String! @hasDefault
    films: [Film!]!
      @associate(on: [{ from: "actor_id", to: "actor_id" }, { from: "film_id", to: "film_id" }], through: "film_actor")
      @many
    filmsAggregate: Film @associate(aggregate: "films") @aggregate @many(model: "Film")
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
    lastUpdate: String! @hasDefault
    actors: [Actor!]!
      @associate(on: [{ from: "film_id", to: "film_id" }, { from: "actor_id", to: "actor_id" }], through: "film_actor")
      @many
    actorsAggregate: Actor @associate(aggregate: "actors") @aggregate @many(model: "Actor")
    language: Language! @associate(on: { from: "language_id", to: "language_id" })
    originalLanguage: Language @associate(on: { from: "original_language_id", to: "language_id" })
  }

  type Language @model(table: "language", pk: "language_id") {
    id: ID! @col(name: "language_id") @hasDefault
    name: String!
    lastUpdate: String! @hasDefault
    films: [Film!]! @associate(on: { from: "language_id", to: "language_id" }) @many
    filmsAggregate: Film @associate(aggregate: "films") @aggregate @many(model: "Film")
  }

  enum FilmRating {
    G
    PG
    PG13 @value(is: "PG-13")
    R
    NC17 @value(is: "NC-17")
  }
`
export const schema = makeSqlmancerSchema({
  typeDefs,
  resolvers: {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
  },
})
