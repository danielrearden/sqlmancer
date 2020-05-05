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
  lastUpdate?: Date | string
}

export declare type ActorUpdateFields = {
  firstName?: string
  lastName?: string
  lastUpdate?: Date | string
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
  specialFeatures: string[]
  extraData: JSON
  lastUpdate: string
}

export declare type FilmIds = 'id'

export declare type FilmEnums = FilmRating

export declare type FilmAssociations = {
  actors: [ActorFindManyBuilder, ActorAggregateBuilder]
  categories: [CategoryFindManyBuilder, CategoryAggregateBuilder]
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
  specialFeatures: string[]
  extraData: JSON
  lastUpdate?: Date | string
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
  specialFeatures?: string[]
  extraData?: JSON
  lastUpdate?: Date | string
}

export declare enum FilmRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG13',
  R = 'R',
  NC17 = 'NC17',
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

export declare type CategoryFields = {
  id: ID
  name: string
  lastUpdate: string
}

export declare type CategoryIds = 'id'

export declare type CategoryEnums = unknown

export declare type CategoryAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export declare type CategoryCreateFields = {
  id?: ID
  name: string
  lastUpdate?: Date | string
}

export declare type CategoryUpdateFields = {
  name?: string
  lastUpdate?: Date | string
}

export declare class CategoryFindOneBuilder<
  TSelected extends Pick<CategoryFields, any> = CategoryFields
> extends FindOneBuilder<'postgres', CategoryFields, CategoryIds, CategoryEnums, CategoryAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class CategoryFindManyBuilder<
  TSelected extends Pick<CategoryFields, any> = CategoryFields
> extends FindManyBuilder<'postgres', CategoryFields, CategoryIds, CategoryEnums, CategoryAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class CategoryFindByIdBuilder<
  TSelected extends Pick<CategoryFields, any> = CategoryFields
> extends FindByIdBuilder<CategoryFields, CategoryIds, CategoryEnums, CategoryAssociations, TSelected> {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class CategoryAggregateBuilder<
  TSelected extends Pick<CategoryFields, any> = CategoryFields
> extends AggregateBuilder<'postgres', CategoryFields, CategoryIds, CategoryEnums, CategoryAssociations> {
  constructor(options: BuilderOptions)
}

export declare class CategoryDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
> {
  constructor(options: BuilderOptions)
}

export declare class CategoryDeleteByIdBuilder extends DeleteByIdBuilder {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class CategoryCreateManyBuilder extends CreateManyBuilder<CategoryCreateFields> {
  constructor(options: BuilderOptions, data: CategoryCreateFields[])
}

export declare class CategoryCreateOneBuilder extends CreateOneBuilder<CategoryCreateFields> {
  constructor(options: BuilderOptions, data: CategoryCreateFields)
}

export declare class CategoryUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  CategoryUpdateFields,
  CategoryFields,
  CategoryIds,
  CategoryEnums,
  CategoryAssociations
> {
  constructor(options: BuilderOptions, data: CategoryUpdateFields)
}

export declare class CategoryUpdateByIdBuilder extends UpdateByIdBuilder<CategoryUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: CategoryUpdateFields)
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
  lastUpdate?: Date | string
}

export declare type LanguageUpdateFields = {
  name?: string
  lastUpdate?: Date | string
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

export declare type CustomerFields = {
  id: ID
  firstName: string
  lastName: string
  email: string
  lastUpdate: string
}

export declare type CustomerIds = 'id'

export declare type CustomerEnums = unknown

export declare type CustomerAssociations = {}

export declare type CustomerCreateFields = {
  id?: ID
  firstName: string
  lastName: string
  email?: string
  lastUpdate?: Date | string
}

export declare type CustomerUpdateFields = {
  firstName?: string
  lastName?: string
  email?: string
  lastUpdate?: Date | string
}

export declare class CustomerFindOneBuilder<
  TSelected extends Pick<CustomerFields, any> = CustomerFields
> extends FindOneBuilder<'postgres', CustomerFields, CustomerIds, CustomerEnums, CustomerAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class CustomerFindManyBuilder<
  TSelected extends Pick<CustomerFields, any> = CustomerFields
> extends FindManyBuilder<'postgres', CustomerFields, CustomerIds, CustomerEnums, CustomerAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class CustomerFindByIdBuilder<
  TSelected extends Pick<CustomerFields, any> = CustomerFields
> extends FindByIdBuilder<CustomerFields, CustomerIds, CustomerEnums, CustomerAssociations, TSelected> {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class CustomerAggregateBuilder<
  TSelected extends Pick<CustomerFields, any> = CustomerFields
> extends AggregateBuilder<'postgres', CustomerFields, CustomerIds, CustomerEnums, CustomerAssociations> {
  constructor(options: BuilderOptions)
}

export declare class CustomerDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
> {
  constructor(options: BuilderOptions)
}

export declare class CustomerDeleteByIdBuilder extends DeleteByIdBuilder {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class CustomerCreateManyBuilder extends CreateManyBuilder<CustomerCreateFields> {
  constructor(options: BuilderOptions, data: CustomerCreateFields[])
}

export declare class CustomerCreateOneBuilder extends CreateOneBuilder<CustomerCreateFields> {
  constructor(options: BuilderOptions, data: CustomerCreateFields)
}

export declare class CustomerUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  CustomerUpdateFields,
  CustomerFields,
  CustomerIds,
  CustomerEnums,
  CustomerAssociations
> {
  constructor(options: BuilderOptions, data: CustomerUpdateFields)
}

export declare class CustomerUpdateByIdBuilder extends UpdateByIdBuilder<CustomerUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: CustomerUpdateFields)
}

export declare type AddressFields = {
  id: ID
  addressLine: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  lastUpdate: string
}

export declare type AddressIds = 'id'

export declare type AddressEnums = unknown

export declare type AddressAssociations = {}

export declare type AddressCreateFields = {
  id: ID
  addressLine: string
  addressLine2?: string
  postalCode?: string
  city: string
  country: string
  lastUpdate: Date | string
}

export declare type AddressUpdateFields = {
  addressLine?: string
  addressLine2?: string
  postalCode?: string
  city?: string
  country?: string
  lastUpdate?: Date | string
}

export declare class AddressFindOneBuilder<
  TSelected extends Pick<AddressFields, any> = AddressFields
> extends FindOneBuilder<'postgres', AddressFields, AddressIds, AddressEnums, AddressAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class AddressFindManyBuilder<
  TSelected extends Pick<AddressFields, any> = AddressFields
> extends FindManyBuilder<'postgres', AddressFields, AddressIds, AddressEnums, AddressAssociations, TSelected> {
  constructor(options: BuilderOptions)
}

export declare class AddressFindByIdBuilder<
  TSelected extends Pick<AddressFields, any> = AddressFields
> extends FindByIdBuilder<AddressFields, AddressIds, AddressEnums, AddressAssociations, TSelected> {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class AddressAggregateBuilder<
  TSelected extends Pick<AddressFields, any> = AddressFields
> extends AggregateBuilder<'postgres', AddressFields, AddressIds, AddressEnums, AddressAssociations> {
  constructor(options: BuilderOptions)
}

export declare class AddressDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
> {
  constructor(options: BuilderOptions)
}

export declare class AddressDeleteByIdBuilder extends DeleteByIdBuilder {
  constructor(options: BuilderOptions, pk: ID)
}

export declare class AddressCreateManyBuilder extends CreateManyBuilder<AddressCreateFields> {
  constructor(options: BuilderOptions, data: AddressCreateFields[])
}

export declare class AddressCreateOneBuilder extends CreateOneBuilder<AddressCreateFields> {
  constructor(options: BuilderOptions, data: AddressCreateFields)
}

export declare class AddressUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  AddressUpdateFields,
  AddressFields,
  AddressIds,
  AddressEnums,
  AddressAssociations
> {
  constructor(options: BuilderOptions, data: AddressUpdateFields)
}

export declare class AddressUpdateByIdBuilder extends UpdateByIdBuilder<AddressUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: AddressUpdateFields)
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
