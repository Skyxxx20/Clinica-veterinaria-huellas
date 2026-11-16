import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { daysFromToday, formatDoseDate } from "../../utils/dates";
import { useVet } from "./VetContext.jsx";
import "./Veterinarian.css";

export default function Vaccines() {
  const { vaccines } = useVet();
  const { results, query } = useSearchFilter(
    vaccines,
    (v) => `${v.pet} ${v.owner} ${v.vaccine}`
  );

  const upcoming = vaccines.filter((v) => {
    const days = daysFromToday(v.next);
    return days >= 0 && days <= 30;
  }).length;

  return (
    <div className="dash">
      <PageHeader />

      <section className="card vet-card">
        <header className="card__head card__head--center">
          <div>
            <h2>Control de vacunas</h2>
            <p>Aplicaciones y próximos refuerzos</p>
          </div>
          <span className="pill pill--wait">
            {upcoming} {upcoming === 1 ? "próxima" : "próximas"}
          </span>
        </header>

        {results.length === 0 ? (
          <p className="empty">
            {query ? `Sin resultados para “${query}”.` : "No hay vacunas registradas."}
          </p>
        ) : (
          <ul className="list">
            {results.map((v) => (
              <li className="vaccine" key={v.id}>
                <div className="vaccine__pet">
                  <span className="pet-avatar tone-mint">{v.initials}</span>
                  <div>
                    <strong>{v.pet}</strong>
                    <small>{v.vaccine}</small>
                  </div>
                </div>
                <div className="vaccine__dose">
                  <small className="eyebrow">Última dosis</small>
                  <strong>{formatDoseDate(v.last)}</strong>
                </div>
                <div className="vaccine__dose">
                  <small className="eyebrow">Próxima dosis</small>
                  <strong>{formatDoseDate(v.next)}</strong>
                </div>
                <button className="btn-outline btn-outline--accent">Registrar dosis</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}