import { GraphQLField, GraphQLInt } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools-fork'
import { OrderByDirective } from './orderBy'
import { WhereDirective } from './where'

export class ManyDirective extends SchemaDirectiveVisitor {
  private where: WhereDirective
  private orderBy: OrderByDirective

  constructor(config: any) {
    super(config)
    this.where = new WhereDirective(config)
    this.orderBy = new OrderByDirective(config)
  }

  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    const whereArg = this.where.visitFieldDefinition(field).args.pop()!
    const orderByArg = this.orderBy.visitFieldDefinition(field).args.pop()!
    return {
      ...field,
      args: [
        ...field.args,
        whereArg,
        orderByArg,
        {
          name: 'limit',
          type: GraphQLInt,
          description: '',
          defaultValue: undefined,
          extensions: undefined,
          astNode: undefined,
        },
        {
          name: 'offset',
          type: GraphQLInt,
          description: '',
          defaultValue: undefined,
          extensions: undefined,
          astNode: undefined,
        },
      ],
    }
  }
}
