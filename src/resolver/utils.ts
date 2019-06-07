import { IFieldResolver } from 'graphql-tools';
import { Identifiable } from '../gnucash/types';

export function find<E extends Identifiable>(
  elements: E[],
  id: string
): E | undefined {
  return elements.find((e) => e.id === id);
}

export function finder<Source, Target extends Identifiable, Context = any>(
  accessor: (source: Source) => Target[]
): IFieldResolver<Source, Context, { id: string }> {
  return (source, { id }) => find(accessor(source), id);
}
