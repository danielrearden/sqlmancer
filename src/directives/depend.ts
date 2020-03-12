import { SchemaDirectiveVisitor } from 'graphql-tools-fork'

export class DependDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }
}
