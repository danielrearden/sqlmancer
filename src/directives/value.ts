import _ from 'lodash'
import { GraphQLEnumValue, GraphQLEnumType } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools-fork'

export class ValueDirective extends SchemaDirectiveVisitor {
  visitEnumValue(
    enumValue: GraphQLEnumValue,
    details: { enumType: GraphQLEnumType }
  ): void {
    // Note: returning a enum value will not actually update the Enum type,
    // so for now, we're updating the internals of the type directly instead
    const enumType = details.enumType as any
    enumType._values = enumType._values.map((value: GraphQLEnumValue) => {
      if (value.name === enumValue.name) {
        return {
          ...value,
          value: this.args.string,
        }
      }
      return value
    })
    enumType._valueLookup = new Map(
      enumType._values.map((value: GraphQLEnumValue) => [value.value, value]),
    )
    enumType._nameLookup = _.keyBy(enumType._values, (value: GraphQLEnumValue) => value.name)
  }
}
