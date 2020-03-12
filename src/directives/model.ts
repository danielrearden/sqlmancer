import { SchemaDirectiveVisitor } from 'graphql-tools-fork'

export class ModelDirective extends SchemaDirectiveVisitor {
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
