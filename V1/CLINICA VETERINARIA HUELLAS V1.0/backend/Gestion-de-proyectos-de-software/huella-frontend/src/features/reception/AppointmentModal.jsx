import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, ChevronDown } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import { usePatients } from "../../services/patientsStore";
import { nextQuarterHour, todayStr } from "../../utils/dates";
import { normalize } from "../../Utils/text.js";

const EMPTY = { patient: "", date: todayStr(), time: nextQuarterHour() };

export default function AppointmentModal({ open, onClose, onSave }) {
  const patients = usePatients();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const options = useMemo(
    () => patients.map((patient) => ({
      value: `${patient.name} · ${patient.owner}`,
      patient,
    })),
    [patients]
  );

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, date: todayStr(), time: nextQuarterHour() });
      setError("");
    }
  }, [open]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    const selected = options.find(
      (option) => normalize(option.value) === normalize(form.patient)
    );

    if (!selected) return setError("Selecciona una mascota registrada");
    if (!form.date || !form.time) return setError("Indica la fecha y la hora de la cita");

    const result = onSave({ patient: selected.patient, date: form.date, time: form.time });
    if (!result.ok) setError(result.error);
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="appointment-title">
      <span className="modal__icon">
        <CalendarCheck size={22} strokeWidth={1.7} />
      </span>
      <h2 className="modal__title" id="appointment-title">Nueva cita</h2>
      <p className="modal__subtitle">Completa la información para programar la cita.</p>

      <form onSubmit={submit} noValidate>
        <div className="form-field">
          <label htmlFor="appointment-patient">Mascota</label>
          <input
            id="appointment-patient"
            className={`form-control ${error ? "is-invalid" : ""}`}
            list="appointment-patients"
            placeholder="Mascota · Propietario"
            autoComplete="off"
            data-autofocus
            value={form.patient}
            onChange={update("patient")}
          />
          <datalist id="appointment-patients">
            {options.map((option) => <option key={option.value} value={option.value} />)}
          </datalist>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="appointment-date">Fecha</label>
            <input
              id="appointment-date"
              type="date"
              min={todayStr()}
              className="form-control"
              value={form.date}
              onChange={update("date")}
            />
          </div>
          <div className="form-field">
            <label htmlFor="appointment-time">Hora</label>
            <input
              id="appointment-time"
              type="time"
              className="form-control"
              value={form.time}
              onChange={update("time")}
            />
          </div>
        </div>

        {error && <p className="form-banner" role="alert">{error}</p>}
        <button type="submit" className="modal__submit">
          Guardar cita <ChevronDown size={16} />
        </button>
      </form>
    </Modal>
  );
}