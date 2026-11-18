import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { appointments as initialAppointments } from "./ownersData.js";
import "./owners.css";

function badgeOf(a) {
  if (a.requested === "cancel") return { label: "Cancelación solicitada", cls: "pill--cancel" };
  if (a.requested === "reschedule") return { label: "Reprogramación solicitada", cls: "pill--muted" };
  if (a.status === "confirmed") return { label: "Confirmada", cls: "pill--ok" };
  return { label: "Pendiente", cls: "pill--wait" };
}

export default function MyAppointments() {
  const [items, setItems] = useState(initialAppointments);
  const { results, query } = useSearchFilter(items, (a) => `${a.pet} ${a.title}`);

  const request = (a, type) => {
    const verb = type === "cancel" ? "cancelar" : "reprogramar";
    if (window.confirm(`¿Enviar solicitud para ${verb} la cita de ${a.pet}?`)) {
      setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, requested: type } : x)));
    }
  };

  return (
    <div className="dash">
      <PageHeader />

      <section className="card owner-card">
        <header className="card__head card__head--center">
          <div>
            <h2>Citas pendientes</h2>
            <p>Consulta y gestiona tus próximas visitas</p>
          </div>
          <button className="btn-cta">
            <Plus size={18} /> Agendar cita
          </button>
        </header>

        {results.length === 0 ? (
          <p className="empty">
            {query ? `Sin resultados para “${query}”.` : "No tienes citas pendientes."}
          </p>
        ) : (
          <ul className="list">
            {results.map((a) => {
              const badge = badgeOf(a);
              return (
                <li className="appt" key={a.id}>
                  <div className="date-box date-box--sm">
                    <strong>{a.day}</strong>
                    <small>{a.month}</small>
                  </div>
                  <div className="appt__info">
                    <span className="appt__pet">{a.pet}</span>
                    <h3>{a.title}</h3>
                    <p>{a.when}</p>
                  </div>
                  <div className="appt__actions">
                    <span className={`pill ${badge.cls}`}>{badge.label}</span>
                    {!a.requested && (
                      <>
                        <button
                          className="btn-outline btn-outline--accent"
                          onClick={() => request(a, "reschedule")}
                        >
                          Pedir reprogramar
                        </button>
                        <button
                          className="btn-outline btn-outline--danger"
                          onClick={() => request(a, "cancel")}
                        >
                          Pedir cancelar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}