import { ReadStream } from 'fs';
import * as xml2js from 'xml2js';
import { createUnzip } from 'zlib';
import {
  Account,
  Book,
  Commodity,
  Gnucash,
  Split,
  SplitValue,
  Transaction,
} from './types';

export type GnucashSource = ReadStream;

export async function parseGnucash(source: GnucashSource): Promise<Gnucash> {
  const xml = await unzip(source);
  const data = await parseXml(xml);

  return {
    book: parseBook(data['gnc-v2']['gnc:book'][0]),
  };
}

function unzip(source: ReadStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const buffer: string[] = [];
    const unzip = createUnzip();
    source.pipe(unzip);

    unzip
      .on('data', (data: Buffer) => buffer.push(data.toString('utf8')))
      .on('end', () => resolve(buffer.join('')))
      .on('error', reject);
  });
}

function parseXml(xml: string): Promise<any> {
  return new Promise((resolve, reject) =>
    xml2js.parseString(xml, (err, data) => (err ? reject(err) : resolve(data)))
  );
}

function parseBook(data: any): Book {
  const id = data['book:id'][0]._;
  const commodities = data['gnc:commodity'].map(parseCommodity);
  const accounts = data['gnc:account'].map(parseAccount);
  const transactions = data['gnc:transaction'].map(parseTransaction);

  return {
    id,
    commodities,
    accounts,
    transactions,
  };
}

function parseCommodity(data: any): Commodity {
  return {
    id: data['cmdty:id'][0],
    space: data['cmdty:space'][0],
  };
}

function parseAccount(data: any): Account {
  return {
    id: data['act:id'][0]._,
    parentId: 'act:parent' in data && data['act:parent'][0]._,
    name: data['act:name'][0],
    type: data['act:type'][0],
    commodity: {
      space: data['act:commodity'][0]['cmdty:space'][0],
      id: data['act:commodity'][0]['cmdty:id'][0],
    },
    commodityScu: parseInt(data['act:commodity-scu'][0]),
  };
}

function parseTransaction(data: any): Transaction {
  return {
    id: data['trn:id'][0]._,
    currency: {
      space: data['trn:currency'][0]['cmdty:space'][0],
      id: data['trn:currency'][0]['cmdty:id'][0],
    },
    postedAt: parseDate(data['trn:date-posted'][0]['ts:date'][0]),
    enteredAt: parseDate(data['trn:date-posted'][0]['ts:date'][0]),
    description: data['trn:description'][0],
    splits: data['trn:splits'][0]['trn:split'].map(parseSplit),
  };
}

function parseSplit(data: any): Split {
  return {
    id: data['split:id'][0]._,
    reconciledState: data['split:reconciled-state'][0],
    value: parseSplitValue(data['split:value'][0]),
    quantity: parseSplitValue(data['split:quantity'][0]),
    accountId: data['split:account'][0]._,
  };
}

function parseDate(value: string): string {
  const [date, time, zone] = value.split(' ');
  return `${date}T${time}${zone}`;
}

function parseSplitValue(value: string): SplitValue {
  const [nom, denom] = value.split('/');
  return { nom: parseInt(nom), denom: parseInt(denom) };
}
