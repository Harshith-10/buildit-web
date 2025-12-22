import { parseAsString, useQueryState } from "nuqs";

export function useRedirectTo() {
  const [redirectTo] = useQueryState(
    "redirectTo",
    parseAsString.withDefault("/dashboard"),
  );
  return redirectTo;
}
