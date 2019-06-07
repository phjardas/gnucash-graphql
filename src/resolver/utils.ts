import { Identifiable } from 'gnucash';
import { IFieldResolver } from 'graphql-tools';

export function find<E extends Identifiable>(
  elements: E[],
  id: string
): E | undefined {
  return elements.find((e) => e.id === id);
}

export function finder<
  Target extends Identifiable,
  Source = any,
  Context = any
>(elements: Target[]): IFieldResolver<Source, Context, { id: string }> {
  return (_, { id }) => find(elements, id);
}
