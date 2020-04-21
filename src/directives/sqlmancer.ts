import { SchemaDirectiveVisitor } from 'graphql-tools-fork'

export class SqlmancerDirective extends SchemaDirectiveVisitor {
  visitObject(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }
}
