import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SearchContext = createContext({ query: "", setQuery: () => {} });

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();

  // Al cambiar de sección se limpia el buscador
  useEffect(() => {
    setQuery("");
  }, [pathname]);

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);