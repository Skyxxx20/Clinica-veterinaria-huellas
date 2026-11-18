import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell, Plus } from "lucide-react";
import { getSession } from "../../services/session";
import { navConfig } from "./navConfig";
import { useSearch } from "./SearchContext.jsx";
import { useCta } from "./CtaContext.jsx";

export default function Topbar() {
  const searchRef = useRef(null);
  const { pathname } = useLocation();
  const { query, setQuery } = useSearch();
  const { onCta } = useCta();
  const config = navConfig[getSession()?.user?.roleKey] ?? {};

  // El botón principal depende de la sección activa (gana la ruta más específica)
  const items = config.groups?.flatMap((g) => g.items) ?? [];
  const active = items
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
    .sort((a, b) => b.to.length - a.to.length)[0];
  const cta = active?.cta ?? config.cta ?? "Nuevo";

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="topbar">
      <label className="search">
        <Search size={18} strokeWidth={1.7} />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={config.searchPlaceholder ?? "Buscar..."}
        />
        <kbd>⌘ K</kbd>
      </label>

      <div className="topbar__actions">
        <span className="open-badge">
          <i /> Abierto 24/7
        </span>
        {config.showNotifications !== false && (
          <button className="icon-btn" aria-label="Notificaciones">
            <Bell size={20} strokeWidth={1.6} />
            <span className="icon-btn__dot" />
          </button>
        )}
        <button className="btn-new" onClick={() => onCta?.()}>
          <Plus size={20} /> {cta}
        </button>
      </div>
    </header>
  );
}