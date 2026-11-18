import { useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearch } from "../../components/layout/SearchContext.jsx";
import { usePatients } from "../../services/patientsStore";
import { initialsOf, normalize } from "../../Utils/text.js";
import "./owners.css";

export default function OwnersDirectory() {
  const patients = usePatients();
  const { query } = useSearch();

  const owners = useMemo(() => {
    const map = new Map();
    for (const p of patients) {
      const o = map.get(p.owner) ?? { id: p.owner, name: p.owner, phone: p.phone, pets: [] };
      o.pets.push(p.name);
      map.set(p.owner, o);
    }
    return [...map.values()];
  }, [patients]);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return owners;
    return owners.filter((o) => normalize(`${o.name} ${o.pets.join(" ")} ${o.phone}`).includes(q));
  }, [owners, query]);

  return (
    <div className="dash">
      <PageHeader />

      <section className="card">
        <header className="card__head card__head--center">
          <div>
            <h2>Usuarios y propietarios</h2>
            <p>Contactos registrados en Huella</p>
          </div>
          <span className="pill pill--ok">846 activos</span>
        </header>

        {results.length === 0 ? (
          <p className="empty">No se encontraron usuarios para “{query}”.</p>
        ) : (
          <ul className="owners">
            {results.map((o) => (
              <li className="owner" key={o.id}>
                <span className="pet-avatar pet-avatar--lg tone-mint">{initialsOf(o.name)}</span>
                <div className="owner__info">
                  <strong>{o.name}</strong>
                  <small>{o.phone} · {o.pets.join(", ")}</small>
                </div>
                <span className="owner__role">Propietario</span>
                <button className="btn-outline">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}