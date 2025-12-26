import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
  status: parseAsStringEnum(["upcoming", "ongoing", "completed"]),
  sort: parseAsString.withDefault("created-desc"),
  view: parseAsString.withDefault("card"),
  error: parseAsString,
  sessionId: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
