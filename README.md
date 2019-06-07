# GraphQL Wrapper for GnuCash Ledgers

This module provides a GraphQL schema and resolvers to implement a GraphQL view to a single GnuCash file.

## Installation

```bash
# with npm
npm i gnucash-graphql

# with yarn
yarn add gnucash-graphql
```

## Usage

```typescript
import { createResolver, typeDefs } from 'gnucash-graphql';
import * as fs from 'fs';

(async () => {
  const source = fs.createReadStream('MyGnucashFile.gnucash');
  const resolvers = await createResolver(source);

  // create the GraphQL server with the framework of your choice:
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
})();
```

## See Also

For a full-blown web application view to your GnuCash ledger see [gnucash-browser](https://github.com/phjardas/gnucash-browser).

## Maintainers

- [Philipp Jardas](https://github.com/phjardas)
