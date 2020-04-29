import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLJSON, GraphQLJSONObject } from 'graphql-type-json'

import { typeDefs as directiveTypeDefs, schemaDirectives } from '../../../directives'

const typeDefs = `
  scalar JSON
  scalar JSONObject

  type Query @sqlmancer(config: {
    dialect: POSTGRES
    transformFieldNames: SNAKE_CASE
    customScalars: {
      JSON: ["JSON", "JSONObject"]
    }
  }) {
    actors: [Actor!]! @where(model: "Actor") @orderBy(model: "Actor") @limit @offset
    actor(id: ID!): Actor
    films: [Film!]! @where(model: "Film") @orderBy(model: "Film") @limit @offset
    film(id: ID!): Film
  }

  type Mutation {
    createFilm: CreateFilmPayload!
  }

  type CreateFilmPayload {
    film: Film
  }

  type Actor @model(table: "actor", pk: "actor_id") {
    id: ID! @col(name: "actor_id")
    firstName: String!
    lastName: String!
    films: [Film!]! @associate(on: [{from: "actor_id", to: "actor_id"}, {from: "film_id", to: "film_id"}], through: "film_actor") @where(model: "Film") @orderBy(model: "Film") @limit @offset
    filmsAggregate: Film @aggregate @many(model: "Film")
  }

  type Film @model(table: "film", pk: "film_id") {
    id: ID! @col(name: "film_id")
    title: String!
    releaseYear: Int!
    rentalRate: Float!
    replacementCost: Float!
    actors: [Actor!]! @associate(on: [{from: "film_id", to: "film_id"}, {from: "actor_id", to: "actor_id"}], through: "film_actor") @where(model: "Actor") @orderBy(model: "Actor") @limit @offset
  }
`
export const schema = makeExecutableSchema({
  typeDefs: [directiveTypeDefs, typeDefs],
  resolvers: {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
  },
  schemaDirectives,
})
