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
  status: parseAsStringEnum(["all", "submitted", "terminated"]),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
