import { FileText } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { prescriptions } from "./ownersData.js";
import "./owners.css";

export default function MyPrescriptions() {
  const { results, query } = useSearchFilter(prescriptions, (p) => `${p.pet} ${p.title}`);
  const activeCount = prescriptions.filter((p) => p.active).length;

  return (
    <div className="dash">
      <PageHeader />

      <section className="card owner-card">
        <header className="card__head card__head--center">
          <div>
            <h2>Recetas de mis mascotas</h2>
            <p>Prescripciones vigentes y anteriores</p>
          </div>
          <span className="pill pill--ok">{activeCount} vigentes</span>
        </header>

        {results.length === 0 ? (
          <p className="empty">Sin resultados para “{query}”.</p>
        ) : (
          <div className="orx-grid">
            {results.map((p) => (
              <article className="orx" key={p.id}>
                <span className="orx__icon tone-mint">
                  <FileText size={22} strokeWidth={1.7} />
                </span>
                <small className="orx__eyebrow">
                  Receta <span>· {p.pet}</span>
                </small>
                <h3>{p.title}</h3>
                <p>{p.detail}</p>
                <small className="orx__meta">{p.meta}</small>
                <button className="btn-outline">Ver receta</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}