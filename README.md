> ⚠️ This is an **early alpha release**. There's quite a few features that are still planned for the beta release and the API is very likely to change based on community feedback. Feel free to play around with the CLI and leave some feedback but please don't use the library in production. 

<center><h1>Sqlmancer</h1></center>

<center><h3>✨⭐ Conjuring SQL from your GraphQL queries ⭐✨</h3></center>

## How it works

Sqlmancer's goal is to empower you to easily translate GraphQL queries into SQL statements. Sqlmancer generates a fluent, type-safe database client from your schema based on metadata you provide through schema directives. When used inside a resolver, the client can parse the field's arguments and selection set in order to generate a *single* SQL query to fetch all necessary data.

With Sqlmancer, your resolver can be a single line of code while still allowing complex queries like this:

```graphql
query FilmQuery {
  films(
    where: {
      or: [
        { budget: { greaterThanOrEqual: 50000000 } },
        { language: { name: { in: ["Spanish", "French"] } } },
      ]
      actors: { count: { lessThan: 50 } },
    },
    orderBy: [{
      actors: { avg: { popularity: DESC } }
    }],
    limit: 100
  ) {
    id
    title
    actors(
      orderBy: [{
        popularity: DESC
      }],
      limit: 10
    ) {
      id
      firstName
      lastName
      films(
        orderBy: [{
          films: { min: { budget: ASC } }
        }]
        limit: 5
      ) {
        id
        title
      }
    }
  }
}
```

## Features
* **Multiple dialect support.** Sqlmancer supports Postgres, MySQL, MariaDB and SQLite, enabling you to incorporate it into existing projects regardless of what flavor of SQL you're using.
* **Robust filtering and sorting.** Add complex filtering and sorting to your queries, including filtering using logical operators and filtering and sorting by fields and aggregate fields of related models.
* **Arbitrarily deep nesting.** Define one-to-one, one-to-many and many-to-many relationships between models. Related models can be filtered, sorted and paginated just like root-level fields.
* **CRUD made easy.** Create, update and delete records, with or without transactions, using a simple, fluent API. Easily provide WHERE, ORDER BY and LIMIT clauses to your queries when updating and deleting records.
* **Abstract types.** Utilize unions and interfaces in your schema using single table inheritance.
* **Performance.** Avoid the N+1 problem by building a single SQL query to fetch all necessary data, regardless of query depth.

## Design goals
* **Annotation over transformation.** Sqlmancer aims to be as aspect-oriented as possible, with directives being used mostly to annotate your schema rather than outright change its behavior.
* **Limited type-generation.** Sqlmancer offers a handful of convenient directives to generate arguments or types, but these directives are not required for Sqlmancer to work its magic. What types are exposed in the schema is ultimately left up to the developer.
* **Loose coupling.** Sqlmancer data models can be used outside of a GraphQL context, empowering you to keep your business logic out of your resolvers and build the architecture that's right for your app.
* **Flexible and unopinionated.** Sqlmancer enabled you to easily add features like authorization, tracing, cost analysis and depth limits using existing libraries without paying for a "pro" version.

See [the official documentation](https://sqlmancer.netlify.app/) for API reference, guides and more.