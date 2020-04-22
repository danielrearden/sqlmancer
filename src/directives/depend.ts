import { SchemaDirectiveVisitor } from 'graphql-tools'

export class DependDirective extends SchemaDirectiveVisitor<any, any> {
  visitFieldDefinition(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }
}
