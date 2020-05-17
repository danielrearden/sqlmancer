import { GraphQLJSON, GraphQLJSONObject } from 'graphql-scalars'

import { makeSqlmancerSchema } from '../..'

const typeDefs = `
  scalar JSON
  scalar JSONObject

  type Query @sqlmancer(
    dialect: POSTGRES
    transformFieldNames: SNAKE_CASE
    customScalars: {
      JSON: ["JSON", "JSONObject"]
    }
  ) {
    widgets: [Widget!]! @limit @offset @orderBy(model: "Widget") @where(model: "Widget")
    alsoWidgets: [Widget!]! @orderBy @where
    someMoreWidgets: [Widget!]! @many
    paginatedWidgets: Widget @paginate
  }

  type Mutation {
    createWidget: Widget! @input(action: CREATE)
    createWidgets: [Widget!]! @input(action: CREATE, list: true)
    updateWidget: Widget! @input(action: UPDATE)
    updateWidgets: [Widget!]! @input(model: "Widget", action: UPDATE)
  }

  type Widget @model(table: "widgets", pk: "id") {
    id: ID! @hasDefault
    idNullable: ID
    idList: [ID!]!
    string: String!
    stringNullable: String
    stringList: [String!]!
    int: Int!
    intNullable: Int
    intList: [Int!]!
    float: Float!
    floatNullable: Float
    floatList: [Float!]!
    boolean: Boolean!
    booleanNullable: Boolean
    booleanList: [Boolean!]!
    json: JSON!
    jsonNullable: JSON
    jsonList: [JSON!]!
    jsonObject: JSONObject!
    jsonObjectNullable: JSONObject
    jsonObjectList: [JSONObject!]!
    enum: Flavor!
    enumNullable: Flavor
    enumList: [Flavor!]!
    renamedField: String! @col(name: "something_else")
    privateString: String! @private
    privateInt: Int! @private
    derivedField: String @depend(on: ["foo", "bar"])
    unsupportedType: Gizmo
    unsupportedListType: [Gizmo!]!
    gizmos: [Gizmo!]! @relate(on: {from: "id", to: "widget_id"})
    jiggers: [Jigger!]! @relate(through: "widget_jiggers" on:[{from: "id", to: "gizmo_id"}, {from: "jigger_id", to: "id"}])
    privateRelationship: [Jigger!]! @relate(through: "widget_jiggers" on:[{from: "id", to: "gizmo_id"}, {from: "jigger_id", to: "id"}]) @private
    bauble: Bauble @relate(on: {from: "bauble_id", to: "id"})
    ignoredField: String! @ignore
    parentWidget: Widget! @relate(on: { from: "parent_id", to: "id" })
  }

  enum Flavor {
    ORANGE
    GRAPE
    CHERRY
  }

  type Gizmo implements Whatchamacallit @model(table: "gizmos", pk: "id") {
    id: ID! 
    someField: String!
    idNullable: ID
    string: String!
    stringNullable: String
    int: Int!
    intNullable: Int
    float: Float!
    floatNullable: Float
    boolean: Boolean!
    booleanNullable: Boolean
    json: JSON!
    jsonNullable: JSON
    jsonObject: JSONObject!
    jsonObjectNullable: JSONObject
    enum: Flavor!
    enumNullable: Flavor
    enumList: [Flavor!]!
  }

  type Jigger implements Whatchamacallit @model(table: "jiggers", pk: "id") {
    id: ID! 
    someField: String!
  }

  type Bauble implements Whatchamacallit @model(table: "baubles", pk: "id") {
    id: ID! 
    someField: String!
  }

  type Secret implements Whatchamacallit @model(table: "secrets", pk: "id") @private {
    id: ID! 
    someField: String!
  }

  union SearchResult @model(table: "all_items", pk: "id") = Widget | Gizmo | Jigger | Bauble

  interface Whatchamacallit @model(table: "whatchamacallits", pk: "id") {
    someField: String!
  }
`
export const schema = makeSqlmancerSchema({
  typeDefs: typeDefs,
  resolvers: {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
})
