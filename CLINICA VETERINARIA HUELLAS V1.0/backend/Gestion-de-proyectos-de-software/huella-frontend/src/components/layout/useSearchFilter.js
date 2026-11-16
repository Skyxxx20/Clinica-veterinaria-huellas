import { useSearch } from "./SearchContext.jsx";
import { normalize } from "../../Utils/text.js";

export function useSearchFilter(items, toText) {
  const { query } = useSearch();
  const q = normalize(query.trim());
  const results = q ? items.filter((i) => normalize(toText(i)).includes(q)) : items;
  return { results, query };
}