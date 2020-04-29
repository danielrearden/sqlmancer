import { BuilderOptions, ID, Models } from '../../types'
import { AggregateBuilder } from '../../aggregate'
import { FindOneBuilder } from '../../findOne'
import { FindManyBuilder } from '../../findMany'
import { FindByIdBuilder } from '../../findById'
import { DeleteManyBuilder } from '../../deleteMany'
import { DeleteByIdBuilder } from '../../deleteById'
import { CreateManyBuilder } from '../../createMany'
import { CreateOneBuilder } from '../../createOne'
import { UpdateManyBuilder } from '../../updateMany'
import { UpdateByIdBuilder } from '../../updateById'

export type ActorFields = {
  id: number
  firstName: string
  lastName: string
  lastUpdate: string
}

export type ActorAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export type ActorIds = 'id'

export type ActorEnums = unknown

export type ActorCreateFields = {
  firstName: string
  lastName: string
}

export type ActorUpdateFields = {
  firstName?: string
  lastName?: string
}

export type FilmFields = {
  id: number
  title: string
  description: string
  releaseYear: number
  rentalDuration: number
  rentalRate: number
  replacementCost: number
  rating: FilmRating
  specialFeatures: string[]
  lastUpdate: string
}

export enum FilmRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG-13',
  R = 'R',
  NC17 = 'NC-17',
}

export type FilmIds = 'id'

export type FilmEnums = FilmRating

export type FilmAssociations = {
  actors: [ActorFindManyBuilder, ActorAggregateBuilder]
  language: [LanguageFindOneBuilder, LanguageAggregateBuilder]
  originalLanguage: [LanguageFindOneBuilder, LanguageAggregateBuilder]
}

export type FilmCreateFields = {
  title: string
  description: string
  releaseYear: number
  rentalDuration: number
  rentalRate: number
  replacementCost: number
  rating: FilmRating
  specialFeatures: string[]
}

export type FilmUpdateFields = {
  title?: string
  description?: string
  releaseYear?: number
  rentalDuration?: number
  rentalRate?: number
  replacementCost?: number
  rating?: FilmRating
  specialFeatures?: string[]
}

export type LanguageFields = {
  id: number
  name: string
  lastUpdate: string
}

export type LanguageIds = 'id'

export type LanguageEnums = unknown

export type LanguageAssociations = {
  films: [FilmFindManyBuilder, FilmAggregateBuilder]
}

export type LanguageCreateFields = {
  name: string
}

export type LanguageUpdateFields = {
  name?: string
}

export const models: Models = {
  Actor: {
    tableName: 'actor',
    primaryKey: 'actor_id',
    fields: {
      id: { column: 'actor_id', type: 'ID' },
      firstName: { column: 'first_name', type: 'string' },
      lastName: { column: 'last_name', type: 'string' },
      lastUpdate: { column: 'last_update', type: 'string' },
    },
    include: [],
    dependencies: {},
    associations: {
      films: {
        modelName: 'Film',
        isMany: true,
        on: [
          { from: 'actor_id', to: 'actor_id' },
          { from: 'film_id', to: 'film_id' },
        ],
        through: 'film_actor',
        builder: options => new FilmFindManyBuilder(options),
        aggregateBuilder: options => new FilmAggregateBuilder(options),
      },
    },
    aggregates: {
      filmsAggregate: 'films',
    },
  },
  Film: {
    tableName: 'film',
    primaryKey: 'film_id',
    fields: {
      id: { column: 'film_id', type: 'ID' },
      title: { column: 'title', type: 'string' },
      description: { column: 'description', type: 'string' },
      releaseYear: { column: 'release_year', type: 'number' },
      rentalDuration: { column: 'rental_duration', type: 'number' },
      rentalRate: { column: 'rental_rate', type: 'number' },
      replacementCost: { column: 'replacement_cost', type: 'number' },
      rating: { column: 'rating', type: 'string' },
      specialFeatures: { column: 'special_features', type: 'string[]' },
      lastUpdate: { column: 'last_update', type: 'string' },
    },
    include: [],
    dependencies: {},
    associations: {
      actors: {
        modelName: 'Actor',
        isMany: true,
        on: [
          { from: 'film_id', to: 'film_id' },
          { from: 'actor_id', to: 'actor_id' },
        ],
        through: 'film_actor',
        builder: options => new ActorFindManyBuilder(options),
        aggregateBuilder: options => new ActorAggregateBuilder(options),
      },
      language: {
        modelName: 'Language',
        isMany: false,
        on: [{ from: 'language_id', to: 'language_id' }],
        builder: options => new LanguageFindOneBuilder(options),
        aggregateBuilder: options => new LanguageAggregateBuilder(options),
      },
      originalLanguage: {
        modelName: 'Language',
        isMany: false,
        on: [{ from: 'original_language_id', to: 'language_id' }],
        builder: options => new LanguageFindOneBuilder(options),
        aggregateBuilder: options => new LanguageAggregateBuilder(options),
      },
    },
    aggregates: {},
  },
  Language: {
    tableName: 'language',
    primaryKey: 'language_id',
    fields: {
      id: { column: 'language_id', type: 'ID' },
      name: { column: 'name', type: 'string' },
      lastUpdate: { column: 'last_update', type: 'string' },
    },
    include: [],
    dependencies: {},
    associations: {
      films: {
        modelName: 'Film',
        isMany: true,
        on: [{ from: 'language_id', to: 'language_id' }],
        builder: options => new FilmFindManyBuilder(options),
        aggregateBuilder: options => new FilmAggregateBuilder(options),
      },
    },
    aggregates: {},
  },
}

export class ActorFindOneBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> extends FindOneBuilder<
  'postgres',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
> {
  constructor(options: BuilderOptions) {
    super(options, 'Actor', models)
  }
}

export class ActorFindManyBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> extends FindManyBuilder<
  'postgres',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
> {
  constructor(options: BuilderOptions) {
    super(options, 'Actor', models)
  }
}

export class ActorFindByIdBuilder<TSelected extends Pick<ActorFields, any> = ActorFields> extends FindByIdBuilder<
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  TSelected
> {
  constructor(options: BuilderOptions, pk: ID) {
    super(options, 'Actor', models, pk)
  }
}

export class ActorAggregateBuilder extends AggregateBuilder<
  'postgres',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations,
  {}
> {
  constructor(options: BuilderOptions) {
    super(options, 'Actor', models)
  }
}

export class ActorDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations
> {
  constructor(options: BuilderOptions) {
    super(options, 'Actor', models)
  }
}

export class ActorDeleteByIdBuilder extends DeleteByIdBuilder<ActorFields, ActorIds, ActorEnums, ActorAssociations> {
  constructor(options: BuilderOptions, pk: ID) {
    super(options, 'Actor', models, pk)
  }
}

export class ActorCreateManyBuilder extends CreateManyBuilder<ActorCreateFields> {
  constructor(options: BuilderOptions, data: ActorCreateFields[]) {
    super(options, 'Actor', models, data)
  }
}

export class ActorCreateOneBuilder extends CreateOneBuilder<ActorCreateFields> {
  constructor(options: BuilderOptions, data: ActorCreateFields) {
    super(options, 'Actor', models, data)
  }
}

export class ActorUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  ActorUpdateFields,
  ActorFields,
  ActorIds,
  ActorEnums,
  ActorAssociations
> {
  constructor(options: BuilderOptions, data: ActorUpdateFields) {
    super(options, 'Actor', models, data)
  }
}

export class ActorUpdateByIdBuilder extends UpdateByIdBuilder<ActorUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: ActorUpdateFields) {
    super(options, 'Actor', models, pk, data)
  }
}

export class FilmFindOneBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> extends FindOneBuilder<
  'postgres',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
> {
  constructor(options: BuilderOptions) {
    super(options, 'Film', models)
  }
}

export class FilmFindManyBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> extends FindManyBuilder<
  'postgres',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
> {
  constructor(options: BuilderOptions) {
    super(options, 'Film', models)
  }
}

export class FilmFindByIdBuilder<TSelected extends Pick<FilmFields, any> = FilmFields> extends FindByIdBuilder<
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  TSelected
> {
  constructor(options: BuilderOptions, pk: ID) {
    super(options, 'Film', models, pk)
  }
}

export class FilmAggregateBuilder extends AggregateBuilder<
  'postgres',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations,
  {}
> {
  constructor(options: BuilderOptions) {
    super(options, 'Film', models)
  }
}

export class FilmDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations
> {
  constructor(options: BuilderOptions) {
    super(options, 'Film', models)
  }
}

export class FilmDeleteByIdBuilder extends DeleteByIdBuilder<FilmFields, FilmIds, FilmEnums, FilmAssociations> {
  constructor(options: BuilderOptions, pk: ID) {
    super(options, 'Film', models, pk)
  }
}

export class FilmCreateManyBuilder extends CreateManyBuilder<FilmCreateFields> {
  constructor(options: BuilderOptions, data: FilmCreateFields[]) {
    super(options, 'Film', models, data)
  }
}

export class FilmCreateOneBuilder extends CreateOneBuilder<FilmCreateFields> {
  constructor(options: BuilderOptions, data: FilmCreateFields) {
    super(options, 'Film', models, data)
  }
}

export class FilmUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  FilmUpdateFields,
  FilmFields,
  FilmIds,
  FilmEnums,
  FilmAssociations
> {
  constructor(options: BuilderOptions, data: FilmUpdateFields) {
    super(options, 'Film', models, data)
  }
}

export class FilmUpdateByIdBuilder extends UpdateByIdBuilder<FilmUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: FilmUpdateFields) {
    super(options, 'Film', models, pk, data)
  }
}

export class LanguageFindOneBuilder<
  TSelected extends Pick<LanguageFields, any> = LanguageFields
> extends FindOneBuilder<'postgres', LanguageFields, LanguageIds, LanguageEnums, LanguageAssociations, TSelected, {}> {
  constructor(options: BuilderOptions) {
    super(options, 'Language', models)
  }
}

export class LanguageFindManyBuilder<
  TSelected extends Pick<LanguageFields, any> = LanguageFields
> extends FindManyBuilder<'postgres', LanguageFields, LanguageIds, LanguageEnums, LanguageAssociations, TSelected, {}> {
  constructor(options: BuilderOptions) {
    super(options, 'Language', models)
  }
}

export class LanguageFindByIdBuilder<
  TSelected extends Pick<LanguageFields, any> = LanguageFields
> extends FindByIdBuilder<LanguageFields, LanguageIds, LanguageEnums, LanguageAssociations, TSelected> {
  constructor(options: BuilderOptions, pk: ID) {
    super(options, 'Language', models, pk)
  }
}

export class LanguageAggregateBuilder extends AggregateBuilder<
  'postgres',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations,
  {}
> {
  constructor(options: BuilderOptions) {
    super(options, 'Language', models)
  }
}

export class LanguageDeleteManyBuilder extends DeleteManyBuilder<
  'postgres',
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
> {
  constructor(options: BuilderOptions) {
    super(options, 'Language', models)
  }
}

export class LanguageDeleteByIdBuilder extends DeleteByIdBuilder<
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
> {
  constructor(options: BuilderOptions, pk: ID) {
    super(options, 'Language', models, pk)
  }
}

export class LanguageCreateManyBuilder extends CreateManyBuilder<LanguageCreateFields> {
  constructor(options: BuilderOptions, data: LanguageCreateFields[]) {
    super(options, 'Language', models, data)
  }
}

export class LanguageCreateOneBuilder extends CreateOneBuilder<LanguageCreateFields> {
  constructor(options: BuilderOptions, data: LanguageCreateFields) {
    super(options, 'Language', models, data)
  }
}

export class LanguageUpdateManyBuilder extends UpdateManyBuilder<
  'postgres',
  LanguageUpdateFields,
  LanguageFields,
  LanguageIds,
  LanguageEnums,
  LanguageAssociations
> {
  constructor(options: BuilderOptions, data: LanguageUpdateFields) {
    super(options, 'Language', models, data)
  }
}

export class LanguageUpdateByIdBuilder extends UpdateByIdBuilder<LanguageUpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: LanguageUpdateFields) {
    super(options, 'Language', models, pk, data)
  }
}
