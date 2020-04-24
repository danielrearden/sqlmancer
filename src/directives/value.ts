import { GraphQLEnumValue } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

export class ValueDirective extends SchemaDirectiveVisitor<any, any> {
  visitEnumValue(enumValue: GraphQLEnumValue): GraphQLEnumValue {
    return {
      ...enumValue,
      value: this.args.is,
    }
  }
}
