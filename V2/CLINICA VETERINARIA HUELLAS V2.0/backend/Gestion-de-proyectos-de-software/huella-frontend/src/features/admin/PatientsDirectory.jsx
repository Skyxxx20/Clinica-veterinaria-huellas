import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { getSession } from "../../services/session.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearch } from "../../components/layout/SearchContext.jsx";
import { patients } from "../patients/patientsData.js";
import { ADMIN_SUBTITLE } from "./AlertCenter.jsx";
import "./AdminPages.css";

// Búsqueda sin distinguir mayúsculas ni tildes
const normalize = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function PatientsDirectory() {
  const name = getSession()?.user?.name ?? "Administrador";
  const { query } = useSearch();

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return patients;
    return patients.filter((p) => normalize(`${p.name} ${p.owner}`).includes(q));
  }, [query]);

  const count = `${results.length} ${results.length === 1 ? "mascota encontrada" : "mascotas encontradas"}`;

  return (
    <div className="dash">
      <PageHeader name={name} subtitle={ADMIN_SUBTITLE} />

      <section className="card directory">
        <header className="card__head card__head--center">
          <div>
            <h2>Directorio de pacientes</h2>
            <p>{count} · Busca por mascota o propietario</p>
          </div>
          <span className="pill pill--ok">Datos actualizados</span>
        </header>

        {results.length === 0 ? (
          <p className="empty">No se encontraron mascotas para “{query}”.</p>
        ) : (
          <ul className="patients">
            {results.map((p) => (
              <li className="patient" key={p.id}>
                <div className="patient__pet">
                  <span className={`pet-avatar pet-avatar--lg tone-${p.tone}`}>{p.initials}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.species} · {p.age}</small>
                  </div>
                </div>
                <div className="patient__owner">
                  <small className="eyebrow">Propietario</small>
                  <strong>{p.owner}</strong>
                  <small>{p.phone}</small>
                </div>
                <button className="btn-outline">
                  Ver ficha <ChevronRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}