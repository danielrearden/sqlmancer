import { SchemaDirectiveVisitor } from 'graphql-tools'

export class ModelDirective extends SchemaDirectiveVisitor<any, any> {
  visitObject(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }

  visitUnion(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }

  visitInterface(): void {
    // This directive does nothing by itself. It is used in conjunction with the CLI.
  }
}
