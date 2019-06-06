import { parseGnucash } from "../gnucash";
import createQueryResolver from "./Query";
import { CreateResolversFn } from "./types";

export const createResolver: CreateResolversFn = async source => {
  const gnucash = await parseGnucash(source);

  return {
    Query: createQueryResolver(gnucash)
  };
};
