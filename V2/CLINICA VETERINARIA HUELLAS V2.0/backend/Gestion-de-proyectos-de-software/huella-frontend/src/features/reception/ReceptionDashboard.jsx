import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import heroImg from "../../assets/hero.png";
import { stats, nextInLine } from "./receptionData";
import { useReception } from "./ReceptionContext.jsx";
import ArrivalsList from "./ArrivalsList.jsx";
import "./ReceptionDashboard.css";

function AgendaCard({ items, onRegister }) {
  return (
    <section className="card agenda">
      <header className="card__head">
        <div>
          <h2>Agenda y llegadas</h2>
          <p>Registra pacientes conforme llegan a la clínica</p>
        </div>
        <Link to="/recepcion/agenda" className="link-action">
          Agenda completa <ChevronRight size={16} />
        </Link>
      </header>
      <ArrivalsList items={items} onRegister={onRegister} />
    </section>
  );
}

function UrgentCard() {
  return (
    <section className="urgent" style={{ "--hero": `url(${heroImg})` }}>
      <div className="urgent__content">
        <span className="urgent__tag">
          <i /> Urgencias 24/7
        </span>
        <h2>Ingreso prioritario</h2>
        <p>Registra rápidamente una emergencia y alerta al equipo médico.</p>
        <button className="urgent__btn">
          Registrar urgencia <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}

function NextCard() {
  return (
    <section className="card">
      <header className="card__head card__head--center">
        <div>
          <h2>Próximo en atención</h2>
          <p>Sala de espera</p>
        </div>
        <span className="pill pill--wait">{nextInLine.wait}</span>
      </header>
      <div className="next">
        <span className={`pet-avatar tone-${nextInLine.tone}`}>{nextInLine.initials}</span>
        <div className="next__info">
          <strong>{nextInLine.pet}</strong>
          <small>{nextInLine.detail}</small>
        </div>
        <button className="btn-solid">Llamar</button>
      </div>
    </section>
  );
}

export default function ReceptionDashboard() {
  const { today, waitingCount, registerArrival, addedToday, registrationsToday } = useReception();

  const liveStats = stats.map((s) => {
    if (s.id === "espera") return { ...s, value: String(waitingCount) };
    if (s.id === "citas") return { ...s, value: String(Number(s.value) + addedToday) };
    if (s.id === "registros") return { ...s, value: String(Number(s.value) + registrationsToday) };
    return s;
  });

  return (
    <div className="dash">
      <PageHeader />

      <div className="stats">
        {liveStats.map((s) => <StatCard key={s.id} {...s} />)}
      </div>

      <div className="dash__grid dash__grid--stretch">
        <AgendaCard items={today} onRegister={registerArrival} />
        <div className="dash__side">
          <UrgentCard />
          <NextCard />
        </div>
      </div>
    </div>
  );
}