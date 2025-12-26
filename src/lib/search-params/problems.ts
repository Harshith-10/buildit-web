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
  type: parseAsStringEnum([
    "coding",
    "mcq_single",
    "mcq_multi",
    "true_false",
    "descriptive",
  ]),
  difficulty: parseAsStringEnum(["easy", "medium", "hard"]),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);
