import Knex from 'knex'
import {
  AggregateBuilder,
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

export type ID = number | string
export type JSON = boolean | number | string | null | JSONArray | JSONObject
export interface JSONObject {
  [key: string]: JSON
}
export type JSONArray = Array<JSON>

export type ActorFields = {
  id: ID
  firstName: string
  lastName: string
  lastUpdate: string
}

export type ActorIds = 'id'

export type ActorEnums = unknown

export type ActorAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export type ActorCreateFields = {
  id?: ID
  firstName: string
  lastName: string
  lastUpdate?: Date | string
}

export type ActorUpdateFields = {
  firstName?: string
  lastName?: string
  lastUpdate?: Date | string
}

export type ActorFindOneBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> = FindOneBuilder<
  'sqlite',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
>

export type ActorFindManyBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> = FindManyBuilder<
  'sqlite',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
>

export type ActorFindByIdBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> = FindByIdBuilder<
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
>

export type ActorAggregateBuilder = AggregateBuilder<'sqlite', ActorFields, ActorIds, ActorEnums, ActorAssociations>

export type ActorDeleteManyBuilder = DeleteManyBuilder<'sqlite', ActorFields, ActorIds, ActorEnums, ActorAssociations>

export type ActorDeleteByIdBuilder = DeleteByIdBuilder

export type ActorCreateManyBuilder = CreateManyBuilder<ActorCreateFields>

export type ActorCreateOneBuilder = CreateOneBuilder<ActorCreateFields>

export type ActorUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  ActorUpdateFields,
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations
>

export type ActorUpdateByIdBuilder = UpdateByIdBuilder<ActorUpdateFields>

export type FilmFields = {
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

export type FilmIds = 'id'

export type FilmEnums = FilmRating

export type FilmAssociations = {
  actors: [ActorFindManyBuilder, ActorAggregateBuilder]
  categories: [CategoryFindManyBuilder, CategoryAggregateBuilder]
  language: [LanguageFindOneBuilder, LanguageAggregateBuilder]
  originalLanguage: [LanguageFindOneBuilder, LanguageAggregateBuilder]
}

export type FilmCreateFields = {
  id?: ID
  title: string
  description: string
  releaseYear: number
  length: number
  rating: FilmRating
  rentalRate: number
  rentalDuration: number
  replacementCost: number
  lastUpdate?: Date | string
}

export type FilmUpdateFields = {
  title?: string
  description?: string
  releaseYear?: number
  length?: number
  rating?: FilmRating
  rentalRate?: number
  rentalDuration?: number
  replacementCost?: number
  lastUpdate?: Date | string
}

export type FilmFindOneBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> = FindOneBuilder<
  'sqlite',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
>

export type FilmFindManyBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> = FindManyBuilder<
  'sqlite',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
>

export type FilmFindByIdBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> = FindByIdBuilder<
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
>

export type FilmAggregateBuilder = AggregateBuilder<'sqlite', FilmFields, FilmIds, FilmEnums, FilmAssociations>

export type FilmDeleteManyBuilder = DeleteManyBuilder<'sqlite', FilmFields, FilmIds, FilmEnums, FilmAssociations>

export type FilmDeleteByIdBuilder = DeleteByIdBuilder

export type FilmCreateManyBuilder = CreateManyBuilder<FilmCreateFields>

export type FilmCreateOneBuilder = CreateOneBuilder<FilmCreateFields>

export type FilmUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  FilmUpdateFields,
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations
>

export type FilmUpdateByIdBuilder = UpdateByIdBuilder<FilmUpdateFields>

export type LanguageFields = {
  id: ID
  name: string
  lastUpdate: string
}

export type LanguageIds = 'id'

export type LanguageEnums = unknown

export type LanguageAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export type LanguageCreateFields = {
  id?: ID
  name: string
  lastUpdate?: Date | string
}

export type LanguageUpdateFields = {
  name?: string
  lastUpdate?: Date | string
}

export type LanguageFindOneBuilder<TSelected extends Pick<LanguageFields, any> = LanguageFields> = FindOneBuilder<
  'sqlite',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations,
  TSelected
>

export type LanguageFindManyBuilder<TSelected extends Pick<LanguageFields, any> = LanguageFields> = FindManyBuilder<
  'sqlite',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations,
  TSelected
>

export type LanguageFindByIdBuilder<TSelected extends Pick<LanguageFields, any> = LanguageFields> = FindByIdBuilder<
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations,
  TSelected
>

export type LanguageAggregateBuilder = AggregateBuilder<
  'sqlite',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
>

export type LanguageDeleteManyBuilder = DeleteManyBuilder<
  'sqlite',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
>

export type LanguageDeleteByIdBuilder = DeleteByIdBuilder

export type LanguageCreateManyBuilder = CreateManyBuilder<LanguageCreateFields>

export type LanguageCreateOneBuilder = CreateOneBuilder<LanguageCreateFields>

export type LanguageUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  LanguageUpdateFields,
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
>

export type LanguageUpdateByIdBuilder = UpdateByIdBuilder<LanguageUpdateFields>

export type CustomerFields = {
  id: ID
  firstName: string
  lastName: string
  email: string
  lastUpdate: string
}

export type CustomerIds = 'id'

export type CustomerEnums = unknown

export type CustomerAssociations = {}

export type CustomerCreateFields = {
  id?: ID
  firstName: string
  lastName: string
  email?: string
  lastUpdate?: Date | string
}

export type CustomerUpdateFields = {
  firstName?: string
  lastName?: string
  email?: string
  lastUpdate?: Date | string
}

export type CustomerFindOneBuilder<TSelected extends Pick<CustomerFields, any> = CustomerFields> = FindOneBuilder<
  'sqlite',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations,
  TSelected
>

export type CustomerFindManyBuilder<TSelected extends Pick<CustomerFields, any> = CustomerFields> = FindManyBuilder<
  'sqlite',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations,
  TSelected
>

export type CustomerFindByIdBuilder<TSelected extends Pick<CustomerFields, any> = CustomerFields> = FindByIdBuilder<
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations,
  TSelected
>

export type CustomerAggregateBuilder = AggregateBuilder<
  'sqlite',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
>

export type CustomerDeleteManyBuilder = DeleteManyBuilder<
  'sqlite',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
>

export type CustomerDeleteByIdBuilder = DeleteByIdBuilder

export type CustomerCreateManyBuilder = CreateManyBuilder<CustomerCreateFields>

export type CustomerCreateOneBuilder = CreateOneBuilder<CustomerCreateFields>

export type CustomerUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  CustomerUpdateFields,
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
>

export type CustomerUpdateByIdBuilder = UpdateByIdBuilder<CustomerUpdateFields>

export type CategoryFields = {
  id: ID
  name: string
  lastUpdate: string
}

export type CategoryIds = 'id'

export type CategoryEnums = unknown

export type CategoryAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export type CategoryCreateFields = {
  id?: ID
  name: string
  lastUpdate?: Date | string
}

export type CategoryUpdateFields = {
  name?: string
  lastUpdate?: Date | string
}

export type CategoryFindOneBuilder<TSelected extends Pick<CategoryFields, any> = CategoryFields> = FindOneBuilder<
  'sqlite',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations,
  TSelected
>

export type CategoryFindManyBuilder<TSelected extends Pick<CategoryFields, any> = CategoryFields> = FindManyBuilder<
  'sqlite',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations,
  TSelected
>

export type CategoryFindByIdBuilder<TSelected extends Pick<CategoryFields, any> = CategoryFields> = FindByIdBuilder<
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations,
  TSelected
>

export type CategoryAggregateBuilder = AggregateBuilder<
  'sqlite',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
>

export type CategoryDeleteManyBuilder = DeleteManyBuilder<
  'sqlite',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
>

export type CategoryDeleteByIdBuilder = DeleteByIdBuilder

export type CategoryCreateManyBuilder = CreateManyBuilder<CategoryCreateFields>

export type CategoryCreateOneBuilder = CreateOneBuilder<CategoryCreateFields>

export type CategoryUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  CategoryUpdateFields,
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
>

export type CategoryUpdateByIdBuilder = UpdateByIdBuilder<CategoryUpdateFields>

export type AddressFields = {
  id: ID
  addressLine: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  lastUpdate: string
}

export type AddressIds = 'id'

export type AddressEnums = unknown

export type AddressAssociations = {}

export type AddressCreateFields = {
  id: ID
  addressLine: string
  addressLine2?: string
  postalCode?: string
  city: string
  country: string
  lastUpdate: Date | string
}

export type AddressUpdateFields = {
  addressLine?: string
  addressLine2?: string
  postalCode?: string
  city?: string
  country?: string
  lastUpdate?: Date | string
}

export type AddressFindOneBuilder<TSelected extends Pick<AddressFields, any> = AddressFields> = FindOneBuilder<
  'sqlite',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations,
  TSelected
>

export type AddressFindManyBuilder<TSelected extends Pick<AddressFields, any> = AddressFields> = FindManyBuilder<
  'sqlite',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations,
  TSelected
>

export type AddressFindByIdBuilder<TSelected extends Pick<AddressFields, any> = AddressFields> = FindByIdBuilder<
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations,
  TSelected
>

export type AddressAggregateBuilder = AggregateBuilder<
  'sqlite',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
>

export type AddressDeleteManyBuilder = DeleteManyBuilder<
  'sqlite',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
>

export type AddressDeleteByIdBuilder = DeleteByIdBuilder

export type AddressCreateManyBuilder = CreateManyBuilder<AddressCreateFields>

export type AddressCreateOneBuilder = CreateOneBuilder<AddressCreateFields>

export type AddressUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  AddressUpdateFields,
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
>

export type AddressUpdateByIdBuilder = UpdateByIdBuilder<AddressUpdateFields>

export type MovieFields = {
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

export type MovieIds = 'id'

export type MovieEnums = FilmRating

export type MovieAssociations = {}

export type MovieCreateFields = {
  id?: ID
  title: string
  description: string
  releaseYear: number
  length: number
  rating: FilmRating
  rentalRate: number
  rentalDuration: number
  replacementCost: number
  lastUpdate?: Date | string
}

export type MovieUpdateFields = {
  title?: string
  description?: string
  releaseYear?: number
  length?: number
  rating?: FilmRating
  rentalRate?: number
  rentalDuration?: number
  replacementCost?: number
  lastUpdate?: Date | string
}

export type MovieFindOneBuilder<TSelected extends Pick<MovieFields, any> = MovieFields> = FindOneBuilder<
  'sqlite',
  MovieFields,
  MovieIds,
  MovieEnums,
  MovieAssociations,
  TSelected
>

export type MovieFindManyBuilder<TSelected extends Pick<MovieFields, any> = MovieFields> = FindManyBuilder<
  'sqlite',
  MovieFields,
  MovieIds,
  MovieEnums,
  MovieAssociations,
  TSelected
>

export type MovieFindByIdBuilder<TSelected extends Pick<MovieFields, any> = MovieFields> = FindByIdBuilder<
  MovieFields,
  MovieIds,
  MovieEnums,
  MovieAssociations,
  TSelected
>

export type MovieAggregateBuilder = AggregateBuilder<'sqlite', MovieFields, MovieIds, MovieEnums, MovieAssociations>

export type MovieDeleteManyBuilder = DeleteManyBuilder<'sqlite', MovieFields, MovieIds, MovieEnums, MovieAssociations>

export type MovieDeleteByIdBuilder = DeleteByIdBuilder

export type MovieCreateManyBuilder = CreateManyBuilder<MovieCreateFields>

export type MovieCreateOneBuilder = CreateOneBuilder<MovieCreateFields>

export type MovieUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  MovieUpdateFields,
  MovieFields,
  MovieIds,
  MovieEnums,
  MovieAssociations
>

export type MovieUpdateByIdBuilder = UpdateByIdBuilder<MovieUpdateFields>

export type PersonFields = {
  id: ID
  firstName: string
  lastName: string
  lastUpdate: string
  email: string
}

export type PersonIds = 'id'

export type PersonEnums = unknown

export type PersonAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export type PersonCreateFields = {
  id?: ID
  firstName: string
  lastName: string
  lastUpdate?: Date | string
  email?: string
}

export type PersonUpdateFields = {
  firstName?: string
  lastName?: string
  lastUpdate?: Date | string
  email?: string
}

export type PersonFindOneBuilder<TSelected extends Pick<PersonFields, any> = PersonFields> = FindOneBuilder<
  'sqlite',
  PersonFields,
  PersonIds,
  PersonEnums,
  PersonAssociations,
  TSelected
>

export type PersonFindManyBuilder<TSelected extends Pick<PersonFields, any> = PersonFields> = FindManyBuilder<
  'sqlite',
  PersonFields,
  PersonIds,
  PersonEnums,
  PersonAssociations,
  TSelected
>

export type PersonFindByIdBuilder<TSelected extends Pick<PersonFields, any> = PersonFields> = FindByIdBuilder<
  PersonFields,
  PersonIds,
  PersonEnums,
  PersonAssociations,
  TSelected
>

export type PersonAggregateBuilder = AggregateBuilder<
  'sqlite',
  PersonFields,
  PersonIds,
  PersonEnums,
  PersonAssociations
>

export type PersonDeleteManyBuilder = DeleteManyBuilder<
  'sqlite',
  PersonFields,
  PersonIds,
  PersonEnums,
  PersonAssociations
>

export type PersonDeleteByIdBuilder = DeleteByIdBuilder

export type PersonCreateManyBuilder = CreateManyBuilder<PersonCreateFields>

export type PersonCreateOneBuilder = CreateOneBuilder<PersonCreateFields>

export type PersonUpdateManyBuilder = UpdateManyBuilder<
  'sqlite',
  PersonUpdateFields,
  PersonFields,
  PersonIds,
  PersonEnums,
  PersonAssociations
>

export type PersonUpdateByIdBuilder = UpdateByIdBuilder<PersonUpdateFields>

export enum FilmRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG13',
  R = 'R',
  NC17 = 'NC17',
}
export type SqlmancerClient = Knex & {
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
    Customer: {
      findById: (id: ID) => CustomerFindByIdBuilder
      findMany: () => CustomerFindManyBuilder
      findOne: () => CustomerFindOneBuilder
      aggregate: () => CustomerAggregateBuilder
      createMany: (input: CustomerCreateFields[]) => CustomerCreateManyBuilder
      createOne: (input: CustomerCreateFields) => CustomerCreateOneBuilder
      deleteById: (id: ID) => CustomerDeleteByIdBuilder
      deleteMany: () => CustomerDeleteManyBuilder
      updateById: (id: ID, input: CustomerUpdateFields) => CustomerUpdateByIdBuilder
      updateMany: (input: CustomerUpdateFields) => CustomerUpdateManyBuilder
    }
    Category: {
      findById: (id: ID) => CategoryFindByIdBuilder
      findMany: () => CategoryFindManyBuilder
      findOne: () => CategoryFindOneBuilder
      aggregate: () => CategoryAggregateBuilder
    }
    Address: {
      findById: (id: ID) => AddressFindByIdBuilder
      findMany: () => AddressFindManyBuilder
      findOne: () => AddressFindOneBuilder
      aggregate: () => AddressAggregateBuilder
    }
    Movie: {
      findById: (id: ID) => MovieFindByIdBuilder
      findMany: () => MovieFindManyBuilder
      findOne: () => MovieFindOneBuilder
      aggregate: () => MovieAggregateBuilder
      createMany: (input: MovieCreateFields[]) => MovieCreateManyBuilder
      createOne: (input: MovieCreateFields) => MovieCreateOneBuilder
      deleteById: (id: ID) => MovieDeleteByIdBuilder
      deleteMany: () => MovieDeleteManyBuilder
      updateById: (id: ID, input: MovieUpdateFields) => MovieUpdateByIdBuilder
      updateMany: (input: MovieUpdateFields) => MovieUpdateManyBuilder
    }
    Person: {
      findById: (id: ID) => PersonFindByIdBuilder
      findMany: () => PersonFindManyBuilder
      findOne: () => PersonFindOneBuilder
      aggregate: () => PersonAggregateBuilder
    }
  }
}
