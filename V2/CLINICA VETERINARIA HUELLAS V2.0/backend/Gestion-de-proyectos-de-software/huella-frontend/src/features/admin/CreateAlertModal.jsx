import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import { usePatients } from "../../services/patientsStore";
import { normalize } from "../../Utils/text.js";

const EMPTY = { recipient: "", type: "vaccine", message: "", sendAt: "" };

// Fecha mínima para el input datetime-local (hora local)
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function findRecipient(text, options) {
  const q = normalize(text);
  if (!q) return null;
  const exact = options.find((o) => normalize(o.value) === q);
  if (exact) return exact;
  const byName = options.filter((o) => normalize(o.pet) === q || normalize(o.owner) === q);
  return byName.length === 1 ? byName[0] : null;
}

export default function CreateAlertModal({ open, onClose, onSave }) {
  const patients = usePatients();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const options = useMemo(
    () => patients.map((p) => ({ value: `${p.name} · ${p.owner}`, pet: p.name, owner: p.owner })),
    [patients]
  );

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
    }
  }, [open]);

  const bind = (field) => ({
    value: form[field],
    onChange: (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    const match = findRecipient(form.recipient, options);

    if (!match) next.recipient = "Selecciona una mascota o propietario de la lista";
    if (form.message.trim().length < 5) next.message = "Escribe un mensaje de al menos 5 caracteres";
    if (!form.sendAt) next.sendAt = "Elige la fecha de envío";
    else if (form.sendAt < nowLocal()) next.sendAt = "La fecha no puede estar en el pasado";

    setErrors(next);
    if (Object.keys(next).length) return;

    onSave({
      pet: match.pet,
      owner: match.owner,
      type: form.type,
      message: form.message.trim(),
      sendAt: form.sendAt,
    });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="create-alert-title">
      <span className="modal__icon">
        <Bell size={22} strokeWidth={1.7} />
      </span>
      <h2 className="modal__title" id="create-alert-title">Crear notificación</h2>
      <p className="modal__subtitle">
        Completa la información para guardar el registro en Huella.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="alert-recipient">Destinatario</label>
          <input
            id="alert-recipient"
            className={`form-control ${errors.recipient ? "is-invalid" : ""}`}
            list="alert-recipients"
            placeholder="Mascota o propietario"
            autoComplete="off"
            data-autofocus
            {...bind("recipient")}
          />
          <datalist id="alert-recipients">
            {options.map((o) => (
              <option key={o.value} value={o.value} />
            ))}
          </datalist>
          {errors.recipient && <p className="form-error">{errors.recipient}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="alert-type">Tipo de alerta</label>
          <div className="select">
            <select id="alert-type" className="form-control" {...bind("type")}>
              <option value="vaccine">Vacuna</option>
              <option value="appointment">Cita</option>
              <option value="custom">Aviso general</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="alert-message">Mensaje</label>
          <textarea
            id="alert-message"
            className={`form-control ${errors.message ? "is-invalid" : ""}`}
            placeholder="Escribe el mensaje para la familia..."
            {...bind("message")}
          />
          {errors.message && <p className="form-error">{errors.message}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="alert-send-at">Fecha de envío</label>
          <input
            id="alert-send-at"
            type="datetime-local"
            min={nowLocal()}
            className={`form-control ${errors.sendAt ? "is-invalid" : ""}`}
            {...bind("sendAt")}
          />
          {errors.sendAt && <p className="form-error">{errors.sendAt}</p>}
        </div>

        <button type="submit" className="modal__submit">
          Guardar registro
        </button>
      </form>
    </Modal>
  );
}