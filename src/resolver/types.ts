import { IResolverObject, IResolvers } from "graphql-tools";
import { GnucashSource } from "../gnucash";
import { Gnucash } from "../gnucash/types";

export type CreateResolversFn = (source: GnucashSource) => Promise<IResolvers>;

export type CreateObjectResolverFn = (gnucash: Gnucash) => IResolverObject;
