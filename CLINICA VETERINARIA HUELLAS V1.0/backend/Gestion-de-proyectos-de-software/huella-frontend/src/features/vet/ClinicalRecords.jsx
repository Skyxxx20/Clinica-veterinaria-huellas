import { Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { useVet } from "./VetContext.jsx";
import "./Veterinarian.css";

export default function ClinicalRecords() {
  const { records, removeRecord } = useVet();
  const { results, query } = useSearchFilter(
    records,
    (r) => `${r.pet} ${r.owner} ${r.title}`
  );

  const remove = (r) => {
    if (window.confirm(`¿Eliminar la historia “${r.title}” de ${r.pet}?`)) {
      removeRecord(r.id);
    }
  };

  return (
    <div className="dash">
      <PageHeader />

      <section className="card">
        <header className="card__head card__head--center">
          <div>
            <h2>Historias clínicas</h2>
            <p>Registros médicos recientes</p>
          </div>
          <span className="pill pill--ok">
            {records.length} {records.length === 1 ? "registro" : "registros"}
          </span>
        </header>

        {results.length === 0 ? (
          <p className="empty">
            {query ? `Sin resultados para “${query}”.` : "No hay historias clínicas registradas."}
          </p>
        ) : (
          <ul className="list">
            {results.map((r) => (
              <li className="record" key={r.id}>
                <div className="record__date">
                  <strong>{r.day}</strong>
                  <small>{r.month}</small>
                  <small>{r.year}</small>
                </div>
                <div className="record__body">
                  <span className="record__who">{r.pet} · {r.owner}</span>
                  <h3>{r.title}</h3>
                  <p>{r.summary}</p>
                </div>
                <div className="record__actions">
                  <button className="btn-outline">Editar</button>
                  <button
                    className="btn-icon-danger"
                    aria-label={`Eliminar historia de ${r.pet}`}
                    onClick={() => remove(r)}
                  >
                    <Trash2 size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}