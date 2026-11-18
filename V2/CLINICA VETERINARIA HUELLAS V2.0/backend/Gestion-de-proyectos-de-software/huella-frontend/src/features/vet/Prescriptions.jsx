import { FileText } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { useVet } from "./VetContext.jsx";
import "./Veterinarian.css";

export default function Prescriptions() {
  const { prescriptions } = useVet();
  const { results, query } = useSearchFilter(
    prescriptions,
    (p) => `${p.pet} ${p.owner} ${p.title}`
  );

  return (
    <div className="dash">
      <PageHeader />

      <section className="card vet-card">
        <header className="card__head">
          <div>
            <h2>Recetas y prescripciones</h2>
            <p>Indicaciones emitidas recientemente</p>
          </div>
        </header>

        {results.length === 0 ? (
          <p className="empty">
            {query ? `Sin resultados para “${query}”.` : "No hay recetas emitidas."}
          </p>
        ) : (
          <div className="rx-grid">
            {results.map((p) => (
              <article className="rx" key={p.id}>
                <span className="rx__icon tone-mint">
                  <FileText size={22} strokeWidth={1.7} />
                </span>
                <small className="rx__eyebrow">
                  Prescripción <span>· {p.pet}</span>
                </small>
                <h3>{p.title}</h3>
                <p>{p.detail}</p>
                <button className="btn-outline btn-outline--accent">Ver receta</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}