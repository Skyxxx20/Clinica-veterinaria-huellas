import { ChevronRight } from "lucide-react";
import { to12h } from "../../utils/dates";
import "./ReceptionDashboard.css";

function StatusAction({ status, onRegister }) {
  if (status === "in_consult") return <span className="pill pill--ok">En consulta</span>;
  if (status === "waiting") return <span className="pill pill--wait">En sala</span>;
  return (
    <button className="btn-soft" onClick={onRegister}>
      Registrar llegada
    </button>
  );
}

export default function ArrivalsList({ items, onRegister }) {
  if (items.length === 0) {
    return <p className="empty">No hay pacientes en este turno.</p>;
  }

  return (
    <ul className="arrivals">
      {items.map((a) => (
        <li className="arrival" key={a.id}>
          <div className="arrival__time">
            <strong>{to12h(a.time)}</strong>
            <small>{a.period}</small>
          </div>
          <div className="arrival__pet">
            <span className={`pet-avatar tone-${a.tone}`}>{a.initials}</span>
            <div>
              <strong>{a.pet}</strong>
              <small>{a.detail}</small>
            </div>
          </div>
          <div className="arrival__owner">
            <small>Propietario</small>
            <strong>{a.owner}</strong>
          </div>
          <div className="arrival__action">
            <StatusAction status={a.status} onRegister={() => onRegister(a.id)} />
          </div>
          <button className="chev-btn chev-btn--lg" aria-label={`Ver cita de ${a.pet}`}>
            <ChevronRight size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}