import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
  sort: parseAsString,
  visibility: parseAsStringEnum(["public", "private"]),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
