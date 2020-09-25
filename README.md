# Sqlmancer

### Conjure SQL from your GraphQL queries 🧙🔮✨

![GitHub package.json version](https://img.shields.io/github/package-json/v/danielrearden/sqlmancer) ![GitHub](https://img.shields.io/github/license/danielrearden/sqlmancer) [![Build Status](https://img.shields.io/travis/com/danielrearden/sqlmancer?logo=travis)](https://travis-ci.com/danielrearden/sqlmancer) [![Coverage Status](https://img.shields.io/coveralls/github/danielrearden/sqlmancer?logo=coveralls)](https://coveralls.io/github/danielrearden/sqlmancer?branch=master) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/danielrearden/sqlmancer)](https://lgtm.com/projects/g/danielrearden/sqlmancer/context:javascript) ![Discord](https://img.shields.io/discord/625400653321076807)

> ⚠️ **This project is currently on hiatus.** I am hoping to resume working on Sqlmancer once I have some more free time. Feel free to submit new issues for feature requests or bug reports, although I may not address them immediately.

Sqlmancer is a Node.js library for integrating SQL with GraphQL. It empowers you to effortlessly and efficiently translate GraphQL queries into SQL statements.

## How it works

Sqlmancer generates a fluent, type-safe database client from your schema based on metadata you provide through schema directives. With Sqlmancer, your resolver can be as simple as this:

```js
function resolve (root, args, ctx, info) {
  return Film.findMany().resolveInfo(info).execute();
}
```

while still allowing complex queries like this:

<details>
  <summary>Show query</summary>
  
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

</details>

## Features
* **Multiple dialect support.** Sqlmancer supports Postgres, MySQL, MariaDB and SQLite, enabling you to incorporate it into existing projects regardless of what flavor of SQL you're using.
* **Robust filtering and sorting.** Add complex filtering and sorting to your queries, including filtering using logical operators and filtering and sorting by fields and aggregate fields of related models.
* **Arbitrarily deep nesting.** Define one-to-one, one-to-many and many-to-many relationships between models. Related models can be filtered, sorted and paginated just like root-level fields.
* **Performance.** Avoid the N+1 problem by building a single SQL query to fetch all necessary data, regardless of query depth.
* **Mutations made easy.** Create, update and delete records, with or without transactions, using a simple, fluent API. Easily provide WHERE, ORDER BY and LIMIT clauses to your queries when updating and deleting records.
* **Views and CTEs.** Take advantage of existing views in your database and create inline ones using common table expressions.
* **Custom scalars.** Use the scalars that make sense for your schema.
* **Abstract types.** Utilize unions and interfaces in your schema using views or single table inheritance.

## Design goals
* **Annotation over transformation.** Sqlmancer aims to be as aspect-oriented as possible, with directives being used mostly to annotate your schema rather than outright change its behavior.
* **Limited type-generation.** Sqlmancer offers a number of convenient directives to generate arguments or types, but these directives are never required for Sqlmancer to work its magic. What types are exposed in the schema is ultimately left up to you.
* **More than just CRUD.** Sqlmancer empowers you to create the queries and mutations that are right for your schema.
* **Flexible and unopinionated.** Sqlmancer enabled you to easily add features like authorization, tracing, cost analysis and depth limits using existing libraries without paying for a "pro" version.

See [the official documentation](https://sqlmancer.netlify.app/) for API reference, guides and more.

## Community

If you found a bug, have a feature request or want to contribute to the project, please open an issue. If you need help or have a question, you can ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/sqlmancer) or come chat with us on [Discord](https://discord.com/channels/625400653321076807/710279654140805230)!

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/danielrearden"><img src="https://avatars2.githubusercontent.com/u/18018864?v=4" width="100px;" alt=""/><br /><sub><b>Daniel Rearden</b></sub></a><br /><a href="https://github.com/danielrearden/sqlmancer/commits?author=danielrearden" title="Code">💻</a> <a href="https://github.com/danielrearden/sqlmancer/commits?author=danielrearden" title="Documentation">📖</a> <a href="#ideas-danielrearden" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://lishine.github.io"><img src="https://avatars3.githubusercontent.com/u/6741645?v=4" width="100px;" alt=""/><br /><sub><b>Pavel Ravits</b></sub></a><br /><a href="https://github.com/danielrearden/sqlmancer/commits?author=lishine" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/tadejstanic"><img src="https://avatars0.githubusercontent.com/u/7260332?v=4" width="100px;" alt=""/><br /><sub><b>Tadej Stanic</b></sub></a><br /><a href="https://github.com/danielrearden/sqlmancer/issues?q=author%3Atadejstanic" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/TSiege"><img src="https://avatars0.githubusercontent.com/u/6217518?v=4" width="100px;" alt=""/><br /><sub><b>Tristan Siegel</b></sub></a><br /><a href="https://github.com/danielrearden/sqlmancer/commits?author=TSiege" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
