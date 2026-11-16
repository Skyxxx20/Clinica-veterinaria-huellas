import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { history } from "./ownersData.js";
import "./owners.css";

export default function MedicalHistory() {
  const { results, query } = useSearchFilter(
    history,
    (h) => `${h.pet} ${h.vet} ${h.title}`
  );

  return (
    <div className="dash">
      <PageHeader />

      <section className="card">
        <header className="card__head card__head--center">
          <div>
            <h2>Historias clínicas</h2>
            <p>Registros compartidos por el equipo veterinario</p>
          </div>
          <span className="pill pill--ok">Al día</span>
        </header>

        {results.length === 0 ? (
          <p className="empty">Sin resultados para “{query}”.</p>
        ) : (
          <ul className="list">
            {results.map((h) => (
              <li className="entry" key={h.id}>
                <div className="date-box">
                  <strong>{h.day}</strong>
                  <small>{h.month}</small>
                  <small>{h.year}</small>
                </div>
                <div className="entry__body">
                  <span className="entry__who">{h.pet} · {h.vet}</span>
                  <h3>{h.title}</h3>
                  <p>{h.summary}</p>
                </div>
                <button className="btn-outline">Ver detalle</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}