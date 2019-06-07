export interface Gnucash {
  readonly books: Book[];
}

export interface Identifiable {
  readonly id: string;
}

export interface Book extends Identifiable {
  readonly commodities: Commodity[];
  readonly accounts: Account[];
  readonly transactions: Transaction[];
}

export type CommoditySpace = string;

export interface Commodity extends Identifiable {
  readonly bookId: string;
  readonly space: CommoditySpace;
}

export interface CommodityReference {
  readonly space: CommoditySpace;
  readonly id: string;
}

export type AccountType =
  | 'ROOT'
  | 'BANK'
  | 'EQUITY'
  | 'ASSET'
  | 'LIABILITY'
  | 'RECEIVABLE'
  | 'EXPENSE';

export interface Account extends Identifiable {
  readonly bookId: string;
  readonly parentId?: string;
  readonly name: string;
  readonly type: AccountType;
  readonly commodity: CommodityReference;
  readonly commodityScu: number;
}

export interface Transaction extends Identifiable {
  readonly bookId: string;
  readonly currency: CommodityReference;
  readonly postedAt: string;
  readonly enteredAt: string;
  readonly description: string;
  readonly splits: Split[];
}

export type SplitReconciledState = string;

export interface SplitValue {
  readonly nom: number;
  readonly denom: number;
}

export interface Split extends Identifiable {
  readonly bookId: string;
  readonly reconciledState: SplitReconciledState;
  readonly value: SplitValue;
  readonly quantity: SplitValue;
  readonly accountId: string;
}
