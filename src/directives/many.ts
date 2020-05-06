import { GraphQLField } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

import { LimitDirective } from './limit'
import { OffsetDirective } from './offset'
import { OrderByDirective } from './orderBy'
import { WhereDirective } from './where'
import { mergeFields } from '../utilities/mergeFields'

export class ManyDirective extends SchemaDirectiveVisitor<any, any> {
  private limit: LimitDirective
  private offset: OffsetDirective
  private orderBy: OrderByDirective
  private where: WhereDirective

  constructor(config: any) {
    super(config)
    this.limit = new LimitDirective(config)
    this.offset = new OffsetDirective(config)
    this.orderBy = new OrderByDirective(config)
    this.where = new WhereDirective(config)
  }

  visitFieldDefinition(field: GraphQLField<any, any>): GraphQLField<any, any> {
    return mergeFields([
      this.limit.visitFieldDefinition(field),
      this.offset.visitFieldDefinition(field),
      this.orderBy.visitFieldDefinition(field),
      this.where.visitFieldDefinition(field),
    ])
  }
}
