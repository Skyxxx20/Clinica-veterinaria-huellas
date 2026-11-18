import { NavLink } from "react-router-dom";
import { PawPrint, Phone } from "lucide-react";
import { getSession } from "../../services/session";
import { navConfig } from "./navConfig";
import UserMenu from "./UserMenu.jsx";

export default function Sidebar() {
  const role = getSession()?.user?.roleKey;
  const groups = navConfig[role]?.groups ?? [];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <PawPrint size={26} strokeWidth={1.8} />
        </div>
        <div>
          <h2>huella</h2>
          <p>Clínica veterinaria</p>
        </div>
      </div>

      {groups.map((group) => (
        <div className="nav-group" key={group.title}>
          <p className="nav-group__title">{group.title}</p>
          <nav>
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
              >
                <Icon size={22} strokeWidth={1.6} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="support">
        <span className="support__icon">
          <Phone size={20} strokeWidth={1.8} />
        </span>
        <strong>Soporte 24/7</strong>
        <p>Estamos aquí cuando nos necesites.</p>
        <a href="#">Contactar</a>
      </div>

      <UserMenu />
    </aside>
  );
}