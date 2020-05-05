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
  'mysql',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
>

export type ActorFindManyBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> = FindManyBuilder<
  'mysql',
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

export type ActorAggregateBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> = AggregateBuilder<
  'mysql',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations
>

export type ActorDeleteManyBuilder = DeleteManyBuilder<'mysql', ActorFields, ActorIds, ActorEnums, ActorAssociations>

export type ActorDeleteByIdBuilder = DeleteByIdBuilder

export type ActorCreateManyBuilder = CreateManyBuilder<ActorCreateFields>

export type ActorCreateOneBuilder = CreateOneBuilder<ActorCreateFields>

export type ActorUpdateManyBuilder = UpdateManyBuilder<
  'mysql',
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
  extraData: JSON
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
  extraData: JSON
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
  extraData?: JSON
  lastUpdate?: Date | string
}

export enum FilmRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG13',
  R = 'R',
  NC17 = 'NC17',
}
export type FilmFindOneBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> = FindOneBuilder<
  'mysql',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
>

export type FilmFindManyBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> = FindManyBuilder<
  'mysql',
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

export type FilmAggregateBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> = AggregateBuilder<
  'mysql',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations
>

export type FilmDeleteManyBuilder = DeleteManyBuilder<'mysql', FilmFields, FilmIds, FilmEnums, FilmAssociations>

export type FilmDeleteByIdBuilder = DeleteByIdBuilder

export type FilmCreateManyBuilder = CreateManyBuilder<FilmCreateFields>

export type FilmCreateOneBuilder = CreateOneBuilder<FilmCreateFields>

export type FilmUpdateManyBuilder = UpdateManyBuilder<
  'mysql',
  FilmUpdateFields,
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations
>

export type FilmUpdateByIdBuilder = UpdateByIdBuilder<FilmUpdateFields>

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
  'mysql',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations,
  TSelected
>

export type CategoryFindManyBuilder<TSelected extends Pick<CategoryFields, any> = CategoryFields> = FindManyBuilder<
  'mysql',
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

export type CategoryAggregateBuilder<TSelected extends Pick<CategoryFields, any> = CategoryFields> = AggregateBuilder<
  'mysql',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
>

export type CategoryDeleteManyBuilder = DeleteManyBuilder<
  'mysql',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
>

export type CategoryDeleteByIdBuilder = DeleteByIdBuilder

export type CategoryCreateManyBuilder = CreateManyBuilder<CategoryCreateFields>

export type CategoryCreateOneBuilder = CreateOneBuilder<CategoryCreateFields>

export type CategoryUpdateManyBuilder = UpdateManyBuilder<
  'mysql',
  CategoryUpdateFields,
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
>

export type CategoryUpdateByIdBuilder = UpdateByIdBuilder<CategoryUpdateFields>

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
  'mysql',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations,
  TSelected
>

export type LanguageFindManyBuilder<TSelected extends Pick<LanguageFields, any> = LanguageFields> = FindManyBuilder<
  'mysql',
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

export type LanguageAggregateBuilder<TSelected extends Pick<LanguageFields, any> = LanguageFields> = AggregateBuilder<
  'mysql',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
>

export type LanguageDeleteManyBuilder = DeleteManyBuilder<
  'mysql',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
>

export type LanguageDeleteByIdBuilder = DeleteByIdBuilder

export type LanguageCreateManyBuilder = CreateManyBuilder<LanguageCreateFields>

export type LanguageCreateOneBuilder = CreateOneBuilder<LanguageCreateFields>

export type LanguageUpdateManyBuilder = UpdateManyBuilder<
  'mysql',
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
  'mysql',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations,
  TSelected
>

export type CustomerFindManyBuilder<TSelected extends Pick<CustomerFields, any> = CustomerFields> = FindManyBuilder<
  'mysql',
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

export type CustomerAggregateBuilder<TSelected extends Pick<CustomerFields, any> = CustomerFields> = AggregateBuilder<
  'mysql',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
>

export type CustomerDeleteManyBuilder = DeleteManyBuilder<
  'mysql',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
>

export type CustomerDeleteByIdBuilder = DeleteByIdBuilder

export type CustomerCreateManyBuilder = CreateManyBuilder<CustomerCreateFields>

export type CustomerCreateOneBuilder = CreateOneBuilder<CustomerCreateFields>

export type CustomerUpdateManyBuilder = UpdateManyBuilder<
  'mysql',
  CustomerUpdateFields,
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
>

export type CustomerUpdateByIdBuilder = UpdateByIdBuilder<CustomerUpdateFields>

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
  'mysql',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations,
  TSelected
>

export type AddressFindManyBuilder<TSelected extends Pick<AddressFields, any> = AddressFields> = FindManyBuilder<
  'mysql',
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

export type AddressAggregateBuilder<TSelected extends Pick<AddressFields, any> = AddressFields> = AggregateBuilder<
  'mysql',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
>

export type AddressDeleteManyBuilder = DeleteManyBuilder<
  'mysql',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
>

export type AddressDeleteByIdBuilder = DeleteByIdBuilder

export type AddressCreateManyBuilder = CreateManyBuilder<AddressCreateFields>

export type AddressCreateOneBuilder = CreateOneBuilder<AddressCreateFields>

export type AddressUpdateManyBuilder = UpdateManyBuilder<
  'mysql',
  AddressUpdateFields,
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
>

export type AddressUpdateByIdBuilder = UpdateByIdBuilder<AddressUpdateFields>

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
    Category: {
      findById: (id: ID) => CategoryFindByIdBuilder
      findMany: () => CategoryFindManyBuilder
      findOne: () => CategoryFindOneBuilder
      aggregate: () => CategoryAggregateBuilder
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
    Address: {
      findById: (id: ID) => AddressFindByIdBuilder
      findMany: () => AddressFindManyBuilder
      findOne: () => AddressFindOneBuilder
      aggregate: () => AddressAggregateBuilder
    }
  }
}
