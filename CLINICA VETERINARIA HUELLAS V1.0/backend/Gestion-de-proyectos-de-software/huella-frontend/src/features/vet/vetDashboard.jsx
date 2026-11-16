import { ChevronRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { stats, consultations } from "./vetData";
import "./Veterinarian.css";

const STATUS = {
  in_consult: { label: "En consulta", cls: "pill--ok" },
  waiting: { label: "En espera", cls: "pill--wait" },
  confirmed: { label: "Confirmada", cls: "pill--muted" },
};

export default function VetDashboard() {
  const { results, query } = useSearchFilter(consultations, (c) => `${c.pet} ${c.owner}`);

  return (
    <div className="dash">
      <PageHeader />

      <div className="stats">
        {stats.map((s) => <StatCard key={s.id} {...s} />)}
      </div>

      <section className="card vet-card">
        <header className="card__head">
          <div>
            <h2>Consultas de hoy</h2>
            <p>Tu agenda clínica para el turno</p>
          </div>
        </header>

        {results.length === 0 ? (
          <p className="empty">
            {query ? `Sin resultados para “${query}”.` : "No hay consultas programadas."}
          </p>
        ) : (
          <ul className="list">
            {results.map((c) => (
              <li className="consult" key={c.id}>
                <div className="consult__time">
                  <strong>{c.time}</strong>
                  <small>{c.period}</small>
                </div>
                <div className="consult__pet">
                  <span className={`pet-avatar tone-${c.tone}`}>{c.initials}</span>
                  <div>
                    <strong>{c.pet}</strong>
                    <small>{c.detail}</small>
                  </div>
                </div>
                <div className="consult__owner">
                  <small>Propietario</small>
                  <strong>{c.owner}</strong>
                </div>
                <div className="consult__status">
                  <span className={`pill ${STATUS[c.status].cls}`}>{STATUS[c.status].label}</span>
                </div>
                <button className="chev-btn chev-btn--lg" aria-label={`Abrir consulta de ${c.pet}`}>
                  <ChevronRight size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}