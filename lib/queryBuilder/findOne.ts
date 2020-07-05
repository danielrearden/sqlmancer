import { BuilderOptions, Dialect, Models } from '../types'
import { PaginateBuilder } from './paginate'
import { FindBuilder } from './find'

export class FindOneBuilder<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds,
  TEnums,
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >,
  TSelected extends Pick<TFields, any> = TFields,
  TRawSelected extends Record<string, any> = {},
  TLoaded extends Record<string, any> = {}
> extends FindBuilder<TDialect, TFields, TIds, TEnums, TAssociations, false, TSelected, TRawSelected, TLoaded> {
  constructor(options: BuilderOptions, modelName: string, models: Models) {
    super(options, modelName, models, false)
  }
}
