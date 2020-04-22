import {
  validateSchema,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql'

import {
  IDOperators,
  IDListOperators,
  PgStringOperators,
  StringListOperators,
  IntOperators,
  IntListOperators,
  FloatOperators,
  FloatListOperators,
  BooleanOperators,
  BooleanListOperators,
  JSONOperators,
} from '../where'
import { schema } from './__fixtures__/schema'

describe('directives', () => {
  beforeAll(() => {
    validateSchema(schema).forEach(error => {
      throw error
    })
  })

  describe('@private', () => {
    test('correct usage', async () => {
      await new Promise(resolve => process.nextTick(resolve))
      expect(schema.getType('Secret')).toBeUndefined()
      expect((schema.getType('Widget') as GraphQLObjectType).getFields().privateField).toBeUndefined()
    })
  })

  describe('@limit', () => {
    test('correct usage', () => {
      const field = schema.getQueryType()!.getFields().widgets!
      const argument = field.args.find(arg => arg.name === 'limit')
      expect(argument).toBeDefined()
      expect(argument!.type).toBe(GraphQLInt)
    })
  })

  describe('@offset', () => {
    test('correct usage', () => {
      const field = schema.getQueryType()!.getFields().widgets!
      const argument = field.args.find(arg => arg.name === 'offset')
      expect(argument).toBeDefined()
      expect(argument!.type).toBe(GraphQLInt)
    })
  })

  describe('@where', () => {
    test('correct usage', () => {
      const field = schema.getQueryType()!.getFields().widgets!
      const argument = field.args.find(arg => arg.name === 'where')
      const type = argument!.type as GraphQLInputObjectType
      const fields = type.getFields()
      expect(fields.id.type).toStrictEqual(IDOperators)
      expect(fields.idNullable.type).toStrictEqual(IDOperators)
      expect(fields.idList.type).toStrictEqual(IDListOperators)
      expect(fields.string.type).toStrictEqual(PgStringOperators)
      expect(fields.stringNullable.type).toStrictEqual(PgStringOperators)
      expect(fields.stringList.type).toStrictEqual(StringListOperators)
      expect(fields.int.type).toStrictEqual(IntOperators)
      expect(fields.intNullable.type).toStrictEqual(IntOperators)
      expect(fields.intList.type).toStrictEqual(IntListOperators)
      expect(fields.float.type).toStrictEqual(FloatOperators)
      expect(fields.floatNullable.type).toStrictEqual(FloatOperators)
      expect(fields.floatList.type).toStrictEqual(FloatListOperators)
      expect(fields.boolean.type).toStrictEqual(BooleanOperators)
      expect(fields.booleanNullable.type).toStrictEqual(BooleanOperators)
      expect(fields.booleanList.type).toStrictEqual(BooleanListOperators)
      expect(fields.json.type).toStrictEqual(JSONOperators)
      expect(fields.jsonNullable.type).toStrictEqual(JSONOperators)
      expect(fields.jsonList.type).toStrictEqual(JSONOperators)
      expect(fields.jsonObject.type).toStrictEqual(JSONOperators)
      expect(fields.jsonObjectNullable.type).toStrictEqual(JSONOperators)
      expect(fields.jsonObjectList.type).toStrictEqual(JSONOperators)
      expect(fields.enum.type).toStrictEqual(schema.getType('FlavorOperators'))
      expect(fields.enumNullable.type).toStrictEqual(schema.getType('FlavorOperators'))
      expect(fields.enumList.type).toStrictEqual(schema.getType('FlavorListOperators'))
    })
  })

  describe('@orderBy', () => {
    test('correct usage', () => {
      const field = schema.getQueryType()!.getFields().widgets!
      const argument = field.args.find(arg => arg.name === 'orderBy')
      const type = argument!.type as GraphQLList<GraphQLNonNull<GraphQLInputObjectType>>
      const fields = type.ofType.ofType.getFields()
      const sortDirectionEnum = schema.getType('SortDirection')
      expect(fields.id.type).toStrictEqual(sortDirectionEnum)
      expect(fields.idNullable.type).toStrictEqual(sortDirectionEnum)
      expect(fields.string.type).toStrictEqual(sortDirectionEnum)
      expect(fields.stringNullable.type).toStrictEqual(sortDirectionEnum)
      expect(fields.int.type).toStrictEqual(sortDirectionEnum)
      expect(fields.intNullable.type).toStrictEqual(sortDirectionEnum)
      expect(fields.float.type).toStrictEqual(sortDirectionEnum)
      expect(fields.floatNullable.type).toStrictEqual(sortDirectionEnum)
      expect(fields.boolean.type).toStrictEqual(sortDirectionEnum)
      expect(fields.booleanNullable.type).toStrictEqual(sortDirectionEnum)
      expect(fields.enum.type).toStrictEqual(sortDirectionEnum)
      expect(fields.enumNullable.type).toStrictEqual(sortDirectionEnum)
      expect(fields.idList).toBeUndefined()
      expect(fields.stringList).toBeUndefined()
      expect(fields.intList).toBeUndefined()
      expect(fields.floatList).toBeUndefined()
      expect(fields.booleanList).toBeUndefined()
      expect(fields.json).toBeUndefined()
      expect(fields.jsonNullable).toBeUndefined()
      expect(fields.jsonList).toBeUndefined()
      expect(fields.jsonObject).toBeUndefined()
      expect(fields.jsonObjectNullable).toBeUndefined()
      expect(fields.jsonObjectList).toBeUndefined()
      expect(fields.enumList).toBeUndefined()
    })
  })
})
