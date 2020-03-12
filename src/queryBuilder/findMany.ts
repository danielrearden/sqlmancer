import { BuilderOptions, Models } from './types'
import { FindBuilder } from './find'

export class FindManyBuilder<
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any>>,
  TSelected extends Pick<TFields, any> = TFields,
  TRawSelected extends Record<string, any> = {},
  TJoined extends Record<string, any> = {}
> extends FindBuilder<TFields, TIds, TEnums, TAssociations, true, TSelected, TRawSelected, TJoined> {
  constructor(options: BuilderOptions, modelName: string, models: Models) {
    super(options, modelName, models, true)
  }
}
