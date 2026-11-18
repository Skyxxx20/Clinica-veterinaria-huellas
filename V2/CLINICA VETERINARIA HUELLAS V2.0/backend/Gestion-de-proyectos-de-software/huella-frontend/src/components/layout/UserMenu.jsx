import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut } from "lucide-react";
import { getSession, clearSession } from "../../services/session";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default function UserMenu() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const user = getSession()?.user;
  const fullName = user?.fullName ?? user?.name ?? "Usuario";

  // Cierra con clic afuera o Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="user-menu" ref={ref}>
      {open && (
        <div className="user-menu__popover" role="menu">
          <button role="menuitem" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={1.7} />
            Cerrar sesión
          </button>
        </div>
      )}

      <button
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="user-menu__avatar">{user?.initials ?? getInitials(fullName)}</span>
        <span className="user-menu__info">
          <strong>{fullName}</strong>
          <small>{user?.role}</small>
        </span>
        <ChevronLeft
          size={18}
          className={`user-menu__chevron ${open ? "is-open" : ""}`}
        />
      </button>
    </div>
  );
}