import * as fs from 'fs';
import * as path from 'path';

export const typeDefs = fs.readFileSync(
  path.resolve(__dirname, '..', 'schema.graphql'),
  'utf8'
);
