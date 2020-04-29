import { BuilderOptions, Dialect, Models } from './types'
import { AggregateBuilder } from './aggregate'
import { FindBuilder } from './find'

export class FindManyBuilder<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [FindBuilder<any, any, any, any, any, any, any, any, any>, AggregateBuilder<any, any, any, any, any, any>]
  >,
  TSelected extends Pick<TFields, any> = TFields,
  TRawSelected extends Record<string, any> = {},
  TLoaded extends Record<string, any> = {}
> extends FindBuilder<TDialect, TFields, TIds, TEnums, TAssociations, true, TSelected, TRawSelected, TLoaded> {
  constructor(options: BuilderOptions, modelName: string, models: Models) {
    super(options, modelName, models, true)
  }
}
