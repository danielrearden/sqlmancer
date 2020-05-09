import { GraphQLField } from 'graphql'

export function mergeFields(fields: GraphQLField<any, any>[]) {
  return fields.reduce((acc, field) => {
    const args = acc.args
    field.args.forEach((arg) => {
      if (!args.find(({ name }) => name === arg.name)) {
        args.push(arg)
      }
    })
    return { ...acc }
  })
}
