import { SchemaDirectiveVisitor } from 'graphql-tools'

export class HasDefaultDirective extends SchemaDirectiveVisitor<any, any> {
  visitFieldDefinition(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }
}
