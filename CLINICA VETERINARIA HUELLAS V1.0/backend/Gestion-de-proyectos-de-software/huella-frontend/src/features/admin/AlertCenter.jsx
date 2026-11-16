import { Plus, ChevronRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { stats, channels } from "./alertsData";
import { useAdmin } from "./AdminContext.jsx";
import "./AdminPages.css";

export default function AlertCenter() {
  const { alerts, pendingCount, sendNow, openCreateAlert } = useAdmin();

  const liveStats = stats.map((s) =>
    s.id === "pendientes" ? { ...s, value: String(pendingCount) } : s
  );

  return (
    <div className="dash">
      <PageHeader />

      <div className="stats">
        {liveStats.map((s) => <StatCard key={s.id} {...s} />)}
      </div>

      <div className="dash__grid dash__grid--stretch">
        <section className="card alerts-card">
          <header className="card__head card__head--center">
            <div>
              <h2>Notificaciones programadas</h2>
              <p>Recordatorios automáticos de salud y agenda</p>
            </div>
            <button className="btn-cta" onClick={openCreateAlert}>
              <Plus size={18} /> Crear alerta
            </button>
          </header>

          <ul className="alert-list">
            {alerts.map(({ id, title, owner, when, type, icon: Icon, tone, sent }) => (
              <li className="alert-row" key={id}>
                <span className={`alert-row__icon tone-${tone}`}>
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <div className="alert-row__info">
                  <strong>{title}</strong>
                  <small>{owner} · {when}</small>
                </div>
                <span className="pill pill--muted">{type}</span>
                <div className="alert-row__action">
                  {sent ? (
                    <span className="pill pill--ok">Enviada</span>
                  ) : (
                    <button className="btn-outline" onClick={() => sendNow(id)}>
                      Enviar ahora
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="dash__side">
          <section className="card">
            <header className="card__head">
              <div>
                <h2>Envío rápido</h2>
                <p>Canales disponibles</p>
              </div>
            </header>
            <ul className="channels">
              {channels.map(({ id, label, detail, icon: Icon }) => (
                <li key={id}>
                  <button>
                    <Icon size={22} strokeWidth={1.5} />
                    <span>
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}