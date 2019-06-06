export interface Gnucash {
  books: IdMap<Book>;
}

export interface Identifiable {
  id: string;
}

export interface IdMap<E extends Identifiable> {
  [id: string]: E;
}

export interface Book extends Identifiable {
  commodities: IdMap<Commodity>;
  accounts: IdMap<Account>;
  transactions: IdMap<Transaction>;
}

export type CommoditySpace = string;

export interface Commodity extends Identifiable {
  space: CommoditySpace;
}

export interface CommodityReference {
  space: CommoditySpace;
  id: string;
}

export type AccountType =
  | "ROOT"
  | "BANK"
  | "EQUITY"
  | "ASSET"
  | "LIABILITY"
  | "RECEIVABLE"
  | "EXPENSE";

export interface Account extends Identifiable {
  parentId?: string;
  name: string;
  type: AccountType;
  commodity: CommodityReference;
  commodityScu: number;
}

export interface Transaction extends Identifiable {
  currency: CommodityReference;
  postedAt: string;
  enteredAt: string;
  description: string;
  splits: Split[];
}

export type SplitReconciledState = string;

export interface SplitValue {
  nom: number;
  denom: number;
}

export interface Split extends Identifiable {
  reconciledState: SplitReconciledState;
  value: SplitValue;
  quantity: SplitValue;
  accountId: string;
}
