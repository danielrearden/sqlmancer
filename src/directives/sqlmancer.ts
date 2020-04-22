import { SchemaDirectiveVisitor } from 'graphql-tools'

export class SqlmancerDirective extends SchemaDirectiveVisitor<any, any> {
  visitObject(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }
}
