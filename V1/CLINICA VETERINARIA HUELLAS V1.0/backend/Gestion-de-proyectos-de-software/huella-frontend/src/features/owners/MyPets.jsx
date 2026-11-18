import { ChevronRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useSearchFilter } from "../../components/layout/useSearchFilter";
import { pets } from "./ownersData.js";
import "./owners.css";

export default function MyPets() {
  const { results, query } = useSearchFilter(pets, (p) => p.name);

  return (
    <div className="dash">
      <PageHeader />

      <section className="card owner-card">
        <header className="card__head card__head--center">
          <div>
            <h2>Mis mascotas</h2>
            <p>Perfiles de salud vinculados a tu cuenta</p>
          </div>
          <span className="pill pill--ok">{pets.length} mascotas</span>
        </header>

        {results.length === 0 ? (
          <p className="empty">Sin resultados para “{query}”.</p>
        ) : (
          <ul className="pets">
            {results.map((p) => (
              <li className="pet-card" key={p.id}>
                <span className={`pet-avatar pet-avatar--lg tone-${p.tone}`}>{p.initials}</span>
                <div className="pet-card__main">
                  <strong>{p.name}</strong>
                  <small>{p.breed}</small>
                  <button className="btn-outline">
                    Ver perfil <ChevronRight size={14} />
                  </button>
                </div>
                <div className="pet-card__next">
                  <small className="eyebrow">Próximo cuidado</small>
                  <strong>{p.next}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}