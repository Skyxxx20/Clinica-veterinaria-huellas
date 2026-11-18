import PageHeader from "../../components/ui/PageHeader.jsx";
import { useReception } from "./ReceptionContext.jsx";
import ArrivalsList from "./ArrivalsList.jsx";
import "./ReceptionPages.css";

export default function WaitingRoom() {
  const { today, waitingCount, registerArrival } = useReception();

  return (
    <div className="dash">
      <PageHeader />

      <section className="card room-card">
        <header className="card__head card__head--center">
          <div>
            <h2>Sala de espera</h2>
            <p>Pacientes registrados para atención</p>
          </div>
          <span className="pill pill--wait">{waitingCount} esperando</span>
        </header>
        <ArrivalsList items={today} onRegister={registerArrival} />
      </section>
    </div>
  );
}