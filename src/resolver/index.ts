import { IResolvers } from 'graphql-tools';
import { GnucashSource, parseGnucash } from '../gnucash';
import {
  Account,
  Book,
  Commodity,
  CommodityReference,
  Split,
  Transaction,
} from '../gnucash/types';
import { find, finder } from './utils';

export type CreateResolversFn = (source: GnucashSource) => Promise<IResolvers>;

export const createResolver: CreateResolversFn = async (source) => {
  const gnucash = await parseGnucash(source);

  const getBook = (id: string) => {
    const book = find(gnucash.books, id);
    if (!book) throw new Error(`Book not found: ${id}`);
    return book;
  };

  const getCommodity = (bookId: string, ref: CommodityReference) =>
    getBook(bookId).commodities.find(
      (c) => c.space === ref.space && c.id === ref.id
    );

  return {
    Query: {
      books: () => gnucash.books,
      book: finder(() => gnucash.books),
    },
    Book: {
      commodity: finder((book: Book) => book.commodities),
      account: finder((book: Book) => book.accounts),
      transaction: finder((book: Book) => book.transactions),
      rootAccount: (book: Book) => {
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
      book: ({ bookId }: Account) => getBook(bookId),
      parent: ({ bookId, parentId }: Account) =>
        parentId && find(getBook(bookId).accounts, parentId),
      children: ({ bookId, id }: Account) =>
        getBook(bookId).accounts.filter(({ parentId }) => parentId === id),
      commodity: ({ bookId, commodity }: Account) =>
        getCommodity(bookId, commodity),
      transactions: ({ bookId, id }) =>
        getBook(bookId).transactions.filter((tx) =>
          tx.splits.some((split) => split.accountId === id)
        ),
    },
    Commodity: {
      book: ({ bookId }: Commodity) => getBook(bookId),
    },
    Transaction: {
      book: ({ bookId }: Transaction) => getBook(bookId),
      currency: ({ bookId, currency }: Transaction) =>
        getCommodity(bookId, currency),
    },
    Split: {
      account: ({ bookId, accountId }: Split) =>
        find(getBook(bookId).accounts, accountId),
    },
  };
};
