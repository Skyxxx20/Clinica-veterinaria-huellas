import { Link, useNavigate } from "react-router-dom";
import { Heart, CalendarCheck, ChevronRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import {
  featuredPet, nextAppointment, healthPlan, reminders,
} from "./ownersData.js";
import "./owners.css";

const PET_HERO_IMAGE = "/pet-hero.jpg";

function Hero() {
  return (
    <section className="hero" style={{ "--hero": `url(${PET_HERO_IMAGE})` }}>
      <div className="hero__content">
        <span className="hero__badge">
          <Heart size={15} strokeWidth={1.8} /> Todo al día
        </span>
        <h2>La salud de {featuredPet.name}, siempre contigo.</h2>
        <p>Consulta sus vacunas, próximas citas y recomendaciones del equipo veterinario.</p>
        <Link to="/propietario/citas" className="hero__btn">
          <CalendarCheck size={16} strokeWidth={1.8} /> Agendar una cita
        </Link>
      </div>
      <div className="hero__photo">
        <div className="hero__caption">
          <strong>{featuredPet.name}</strong>
          <small>{featuredPet.breed}</small>
        </div>
      </div>
    </section>
  );
}

function NextAppointmentCard() {
  const a = nextAppointment;
  return (
    <section className="card">
      <header className="card__head card__head--center">
        <div>
          <h2>Próxima cita</h2>
          <p>Confirmada</p>
        </div>
        <span className="pill pill--ok">{a.countdown}</span>
      </header>
      <div className="next-appt">
        <div className="date-box date-box--sm">
          <strong>{a.day}</strong>
          <small>{a.month}</small>
        </div>
        <div>
          <strong>{a.title}</strong>
          <small>{a.when}</small>
          <small>{a.where}</small>
        </div>
      </div>
      <footer className="card__foot">
        <button>Ver indicaciones</button>
        <button>Añadir al calendario</button>
      </footer>
    </section>
  );
}

function HealthPlanCard() {
  return (
    <section className="card">
      <header className="card__head card__head--center">
        <div>
          <h2>Plan de salud</h2>
          <p>Progreso anual de {featuredPet.name}</p>
        </div>
        <strong className="plan__pct">{healthPlan.progress}%</strong>
      </header>
      <div className="plan__body">
        <div className="plan__bar" role="progressbar" aria-valuenow={healthPlan.progress}>
          <span style={{ width: `${healthPlan.progress}%` }} />
        </div>
        <ul className="plan__list">
          {healthPlan.items.map((i) => (
            <li key={i.id}>
              <i className={`plan__dot ${i.done ? "" : "is-todo"}`} />
              <strong>{i.label}</strong>
              <span>{i.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RemindersCard() {
  const navigate = useNavigate();
  return (
    <section className="card">
      <header className="card__head">
        <div>
          <h2>Recordatorios</h2>
          <p>Recomendaciones para tus mascotas</p>
        </div>
      </header>
      <ul className="reminders">
        {reminders.map(({ id, title, detail, icon: Icon, tone, to }) => (
          <li key={id}>
            <button onClick={() => to && navigate(to)}>
              <span className={`reminders__icon tone-${tone}`}>
                <Icon size={20} strokeWidth={1.7} />
              </span>
              <span className="reminders__text">
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function OwnerHome() {
  return (
    <div className="dash">
      <PageHeader />
      <Hero />
      <div className="owner-cards">
        <NextAppointmentCard />
        <HealthPlanCard />
        <RemindersCard />
      </div>
    </div>
  );
}