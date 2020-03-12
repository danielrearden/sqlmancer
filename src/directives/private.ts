import { SchemaDirectiveVisitor } from 'graphql-tools-fork'
import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLUnionType } from 'graphql'

export class PrivateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(
    field: GraphQLField<any, any>,
    details: {
      objectType: GraphQLObjectType | GraphQLInterfaceType
    }
  ): void {
    process.nextTick(() => {
      delete details.objectType.getFields()[field.name]
    })
  }

  visitInterface(iface: GraphQLInterfaceType): void {
    process.nextTick(() => {
      delete this.schema.getTypeMap()[iface.name]
    })
  }

  visitObject(object: GraphQLObjectType): void {
    process.nextTick(() => {
      delete this.schema.getTypeMap()[object.name]
    })
  }

  visitUnion(union: GraphQLUnionType): void {
    process.nextTick(() => {
      delete this.schema.getTypeMap()[union.name]
    })
  }
}
