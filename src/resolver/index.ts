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
    },
    Account: {
      book: (account: Account) => getBook(account.bookId),
      parent: (account: Account) =>
        account.parentId &&
        find(getBook(account.bookId).accounts, account.parentId),
      children: (account: Account) =>
        getBook(account.bookId).accounts.find(
          (account) => account.parentId === account.id
        ),
      commodity: (account: Account) =>
        getCommodity(account.bookId, account.commodity),
    },
    Commodity: {
      book: (commodity: Commodity) => getBook(commodity.bookId),
    },
    Transaction: {
      book: (tx: Transaction) => getBook(tx.bookId),
      currency: (tx: Transaction) => getCommodity(tx.bookId, tx.currency),
    },
    Split: {
      account: (split: Split) =>
        find(getBook(split.bookId).accounts, split.accountId),
    },
  };
};
