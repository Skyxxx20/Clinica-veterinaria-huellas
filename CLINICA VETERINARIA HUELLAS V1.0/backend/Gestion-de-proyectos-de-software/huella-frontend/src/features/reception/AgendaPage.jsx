import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useReception } from "./ReceptionContext.jsx";
import "./ReceptionPages.css";

const weekdayFmt = new Intl.DateTimeFormat("es-CO", { weekday: "short" });
const longFmt = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long" });

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

export default function AgendaPage() {
  const { appointments, cancelAppointment } = useReception();
  const [selected, setSelected] = useState(0); // offset respecto a hoy
  const [start, setStart] = useState(-1); // offset del primer tab visible

  const tabs = Array.from({ length: 6 }, (_, i) => {
    const offset = start + i;
    return { offset, date: addDays(offset) };
  });

  const go = (delta) => {
    const next = selected + delta;
    setSelected(next);
    if (next < start) setStart(next);
    else if (next > start + 5) setStart(next - 5);
  };

  const goToday = () => {
    setSelected(0);
    setStart(-1);
  };

  const items = appointments
    .filter((a) => a.dayOffset === selected)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="dash">
      <PageHeader />

      <section className="card">
        <header className="card__head card__head--center">
          <div>
            <h2>Agenda · {longFmt.format(addDays(selected))}</h2>
            <p>Vista diaria · 4 consultorios activos</p>
          </div>
          <div className="cal-nav">
            <button className="btn-outline" onClick={goToday}>Hoy</button>
            <button className="btn-outline btn-outline--sq" aria-label="Día anterior" onClick={() => go(-1)}>
              <ChevronLeft size={14} />
            </button>
            <button className="btn-outline btn-outline--sq" aria-label="Día siguiente" onClick={() => go(1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </header>

        <div className="week">
          {tabs.map(({ offset, date }) => (
            <button
              key={offset}
              className={`week__day ${offset === selected ? "is-active" : ""}`}
              aria-pressed={offset === selected}
              onClick={() => setSelected(offset)}
            >
              <small>{weekdayFmt.format(date).replace(".", "").toUpperCase()}</small>
              <strong>{date.getDate()}</strong>
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="empty">Sin citas programadas para este día.</p>
        ) : (
          <ul className="slots">
            {items.map((a) => {
              const cancelled = a.status === "cancelled";
              return (
                <li className={`slot ${cancelled ? "is-cancelled" : ""}`} key={a.id}>
                  <strong className="slot__time">{a.time}</strong>
                  <span className={`slot__bar bar-${a.tone}`} />
                  <span className={`pet-avatar pet-avatar--lg tone-${a.tone}`}>{a.initials}</span>
                  <div className="slot__info">
                    <strong>{a.pet}</strong>
                    <small>{a.detail} · {a.owner}</small>
                  </div>
                  <div className="slot__actions">
                    <span className="pill pill--muted">{a.consultorio}</span>
                    {cancelled ? (
                      <span className="pill pill--cancel">Cancelada</span>
                    ) : (
                      <>
                        <button className="btn-outline btn-outline--accent">Reprogramar</button>
                        <button
                          className="btn-outline btn-outline--danger"
                          onClick={() => cancelAppointment(a.id)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}