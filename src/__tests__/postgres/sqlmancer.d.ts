import Knex from 'knex'
import {
  AggregateBuilder,
  BuilderOptions,
  CreateManyBuilder,
  CreateOneBuilder,
  DeleteByIdBuilder,
  DeleteManyBuilder,
  FindByIdBuilder,
  FindManyBuilder,
  FindOneBuilder,
  UpdateByIdBuilder,
  UpdateManyBuilder,
} from '../..'

export declare type ID = number | string
export declare type JSON = boolean | number | string | null | JSONArray | JSONObject
export interface JSONObject {
  [key: string]: JSON
}
export declare type JSONArray = Array<JSON>

export declare type ActorFields = {
  id: ID
  firstName: string
  lastName: string
  lastUpdate: string
}

export declare type ActorIds = 'id'

export declare type ActorEnums = unknown

export declare type ActorAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export declare type ActorCreateFields = {
  id?: ID
  firstName: string
  lastName: string
  lastUpdate?: string
}

export declare type ActorUpdateFields = {
  firstName?: string
  lastName?: string
  lastUpdate?: string
}

export declare class ActorFindOneBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> extends FindOneBuilder<
  'postgres',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
> {
  constructor(options: BuilderOptions)
}

export declare class ActorFindManyBuilder<
  TSelected extends Pick<ActorFields, any> = ActorFields
> extends FindManyBuilder<'postgres', ActorFields, ActorIds, ActorEnums, ActorAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class ActorFindByIdBuilder<
  TSelected extends Pick<ActorFields, any> = ActorFields
> extends FindByIdBuilder<ActorFields, ActorIds, ActorEnums, ActorAssociations, TSelected> {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class ActorAggregateBuilder<
  TSelected extends Pick<ActorFields, any> = ActorFields
> extends AggregateBuilder<'postgres', ActorFields, ActorIds, ActorEnums, ActorAssociations> {
  constructor(options: BuilderOptions)
}

export declare class ActorDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations
> {
  constructor(options: BuilderOptions)
}

export declare class ActorDeleteByIdBuilder extends DeleteByIdBuilder {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class ActorCreateManyBuilder extends CreateManyBuilder<ActorCreateFields> {
  constructor(options: BuilderOptions, data: ActorCreateFields[])
}

export declare class ActorCreateOneBuilder extends CreateOneBuilder<ActorCreateFields> {
  constructor(options: BuilderOptions, data: ActorCreateFields)
}

export declare class ActorUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  ActorUpdateFields,
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations
> {
  constructor(options: BuilderOptions, data: ActorUpdateFields)
}

export declare class ActorUpdateByIdBuilder extends UpdateByIdBuilder<ActorUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: ActorUpdateFields)
}

export declare type FilmFields = {
  id: ID
  title: string
  description: string
  releaseYear: number
  length: number
  rating: FilmRating
  rentalRate: number
  rentalDuration: number
  replacementCost: number
  lastUpdate: string
}

export declare type FilmIds = 'id'

export declare type FilmEnums = FilmRating

export declare type FilmAssociations = {
  actors: [ActorFindManyBuilder, ActorAggregateBuilder]
  language: [LanguageFindOneBuilder, LanguageAggregateBuilder]
  originalLanguage: [LanguageFindOneBuilder, LanguageAggregateBuilder]
}

export declare type FilmCreateFields = {
  id?: ID
  title: string
  description: string
  releaseYear: number
  length: number
  rating: FilmRating
  rentalRate: number
  rentalDuration: number
  replacementCost: number
  lastUpdate?: string
}

export declare type FilmUpdateFields = {
  title?: string
  description?: string
  releaseYear?: number
  length?: number
  rating?: FilmRating
  rentalRate?: number
  rentalDuration?: number
  replacementCost?: number
  lastUpdate?: string
}

export declare enum FilmRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG-13',
  R = 'R',
  NC17 = 'NC-17',
}
export declare class FilmFindOneBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> extends FindOneBuilder<
  'postgres',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
> {
  constructor(options: BuilderOptions)
}

export declare class FilmFindManyBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> extends FindManyBuilder<
  'postgres',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
> {
  constructor(options: BuilderOptions)
}

export declare class FilmFindByIdBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> extends FindByIdBuilder<
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
> {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class FilmAggregateBuilder<
  TSelected extends Pick<FilmFields, any> = FilmFields
> extends AggregateBuilder<'postgres', FilmFields, FilmIds, FilmEnums, FilmAssociations> {
  constructor(options: BuilderOptions)
}

export declare class FilmDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations
> {
  constructor(options: BuilderOptions)
}

export declare class FilmDeleteByIdBuilder extends DeleteByIdBuilder {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class FilmCreateManyBuilder extends CreateManyBuilder<FilmCreateFields> {
  constructor(options: BuilderOptions, data: FilmCreateFields[])
}

export declare class FilmCreateOneBuilder extends CreateOneBuilder<FilmCreateFields> {
  constructor(options: BuilderOptions, data: FilmCreateFields)
}

export declare class FilmUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  FilmUpdateFields,
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations
> {
  constructor(options: BuilderOptions, data: FilmUpdateFields)
}

export declare class FilmUpdateByIdBuilder extends UpdateByIdBuilder<FilmUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: FilmUpdateFields)
}

export declare type LanguageFields = {
  id: ID
  name: string
  lastUpdate: string
}

export declare type LanguageIds = 'id'

export declare type LanguageEnums = unknown

export declare type LanguageAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export declare type LanguageCreateFields = {
  id?: ID
  name: string
  lastUpdate?: string
}

export declare type LanguageUpdateFields = {
  name?: string
  lastUpdate?: string
}

export declare class LanguageFindOneBuilder<
  TSelected extends Pick<LanguageFields, any> = LanguageFields
> extends FindOneBuilder<'postgres', LanguageFields, LanguageIds, LanguageEnums, LanguageAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class LanguageFindManyBuilder<
  TSelected extends Pick<LanguageFields, any> = LanguageFields
> extends FindManyBuilder<'postgres', LanguageFields, LanguageIds, LanguageEnums, LanguageAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class LanguageFindByIdBuilder<
  TSelected extends Pick<LanguageFields, any> = LanguageFields
> extends FindByIdBuilder<LanguageFields, LanguageIds, LanguageEnums, LanguageAssociations, TSelected> {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class LanguageAggregateBuilder<
  TSelected extends Pick<LanguageFields, any> = LanguageFields
> extends AggregateBuilder<'postgres', LanguageFields, LanguageIds, LanguageEnums, LanguageAssociations> {
  constructor(options: BuilderOptions)
}

export declare class LanguageDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
> {
  constructor(options: BuilderOptions)
}

export declare class LanguageDeleteByIdBuilder extends DeleteByIdBuilder {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class LanguageCreateManyBuilder extends CreateManyBuilder<LanguageCreateFields> {
  constructor(options: BuilderOptions, data: LanguageCreateFields[])
}

export declare class LanguageCreateOneBuilder extends CreateOneBuilder<LanguageCreateFields> {
  constructor(options: BuilderOptions, data: LanguageCreateFields)
}

export declare class LanguageUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  LanguageUpdateFields,
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
> {
  constructor(options: BuilderOptions, data: LanguageUpdateFields)
}

export declare class LanguageUpdateByIdBuilder extends UpdateByIdBuilder<LanguageUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: LanguageUpdateFields)
}

type SqlmancerClient = Knex & {
  models: {
    Actor: {
      findById: (id: ID) => ActorFindByIdBuilder
      findMany: () => ActorFindManyBuilder
      findOne: () => ActorFindOneBuilder
      aggregate: () => ActorAggregateBuilder
      createMany: (input: ActorCreateFields[]) => ActorCreateManyBuilder
      createOne: (input: ActorCreateFields) => ActorCreateOneBuilder
      deleteById: (id: ID) => ActorDeleteByIdBuilder
      deleteMany: () => ActorDeleteManyBuilder
      updateById: (id: ID, input: ActorUpdateFields) => ActorUpdateByIdBuilder
      updateMany: (input: ActorUpdateFields) => ActorUpdateManyBuilder
    }
    Film: {
      findById: (id: ID) => FilmFindByIdBuilder
      findMany: () => FilmFindManyBuilder
      findOne: () => FilmFindOneBuilder
      aggregate: () => FilmAggregateBuilder
      createMany: (input: FilmCreateFields[]) => FilmCreateManyBuilder
      createOne: (input: FilmCreateFields) => FilmCreateOneBuilder
      deleteById: (id: ID) => FilmDeleteByIdBuilder
      deleteMany: () => FilmDeleteManyBuilder
      updateById: (id: ID, input: FilmUpdateFields) => FilmUpdateByIdBuilder
      updateMany: (input: FilmUpdateFields) => FilmUpdateManyBuilder
    }
    Language: {
      findById: (id: ID) => LanguageFindByIdBuilder
      findMany: () => LanguageFindManyBuilder
      findOne: () => LanguageFindOneBuilder
      aggregate: () => LanguageAggregateBuilder
      createMany: (input: LanguageCreateFields[]) => LanguageCreateManyBuilder
      createOne: (input: LanguageCreateFields) => LanguageCreateOneBuilder
      deleteById: (id: ID) => LanguageDeleteByIdBuilder
      deleteMany: () => LanguageDeleteManyBuilder
      updateById: (id: ID, input: LanguageUpdateFields) => LanguageUpdateByIdBuilder
      updateMany: (input: LanguageUpdateFields) => LanguageUpdateManyBuilder
    }
  }
}
