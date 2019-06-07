import {
  Account,
  CommodityReference,
  GnucashSource,
  parseGnucash,
  Split,
  Transaction,
} from 'gnucash';
import { IResolvers } from 'graphql-tools';
import { find, finder } from './utils';

export type CreateResolversFn = (source: GnucashSource) => Promise<IResolvers>;

export const createResolver: CreateResolversFn = async (source) => {
  const { book } = await parseGnucash(source);

  const getCommodity = (ref: CommodityReference) =>
    book.commodities.find((c) => c.space === ref.space && c.id === ref.id);

  return {
    Query: {
      id: () => book.id,
      commodities: () => book.commodities,
      commodity: finder(book.commodities),
      accounts: () => book.accounts,
      account: finder(book.accounts),
      transactions: () => book.transactions,
      transaction: finder(book.transactions),
      rootAccount: () => {
        const roots = book.accounts.filter(
          (account) => account.type === 'ROOT'
        );

        if (roots.length !== 1) {
          throw new Error(
            `Expected exactly one account of type ROOT but found ${
              roots.length
            }`
          );
        }

        return roots[0];
      },
    },
    Account: {
      parent: ({ parentId }: Account) =>
        parentId && find(book.accounts, parentId),
      children: ({ id }: Account) =>
        book.accounts.filter(({ parentId }) => parentId === id),
      commodity: ({ commodity }: Account) => getCommodity(commodity),
      transactions: ({ id }) =>
        book.transactions.filter((tx) =>
          tx.splits.some((split) => split.accountId === id)
        ),
    },
    Transaction: {
      currency: ({ currency }: Transaction) => getCommodity(currency),
    },
    Split: {
      account: ({ accountId }: Split) => find(book.accounts, accountId),
    },
  };
};
