import { useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { usePatients } from "../../services/patientsStore";
import { normalize } from "../../Utils/text.js";
import { todayStr } from "../../utils/dates";

const EMPTY = { name: "", owner: "", species: "", birthDate: "" };
const SPECIES = ["Perro", "Gato", "Conejo", "Ave", "Hámster", "Otro"];

export default function PetModal({ open, onClose, onSave }) {
  const patients = usePatients();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const owners = useMemo(() => [...new Set(patients.map((p) => p.owner))], [patients]);

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
    const owner = owners.find((o) => normalize(o) === normalize(form.owner));

    if (form.name.trim().length < 2) next.name = "Escribe el nombre de la mascota";
    if (!owner) next.owner = "Selecciona un propietario registrado";
    if (!form.species.trim()) next.species = "Indica la especie";
    if (!form.birthDate) next.birthDate = "Indica la fecha de nacimiento";
    else if (form.birthDate > todayStr()) next.birthDate = "La fecha no puede ser futura";

    if (Object.keys(next).length) return setErrors(next);

    const result = onSave({
      name: form.name.trim(),
      owner,
      species: form.species.trim().replace(/^./, (c) => c.toUpperCase()),
      birthDate: form.birthDate,
    });
    if (!result.ok) setErrors({ [result.field ?? "form"]: result.error });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="pet-title">
      <span className="modal__icon">
        <CalendarCheck size={22} strokeWidth={1.7} />
      </span>
      <h2 className="modal__title" id="pet-title">Registrar nueva mascota</h2>
      <p className="modal__subtitle">Completa la información para guardar el registro en Huella.</p>

      <form onSubmit={handleSubmit} noValidate>
        <FormField id="pet-name" label="Nombre de la mascota" error={errors.name}>
          <input
            id="pet-name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Ej. Max"
            autoComplete="off"
            data-autofocus
            {...bind("name")}
          />
        </FormField>

        <FormField id="pet-owner" label="Propietario" error={errors.owner}>
          <input
            id="pet-owner"
            className={`form-control ${errors.owner ? "is-invalid" : ""}`}
            placeholder="Buscar propietario registrado"
            list="pet-owners"
            autoComplete="off"
            {...bind("owner")}
          />
          <datalist id="pet-owners">
            {owners.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </FormField>

        <div className="form-row">
          <FormField id="pet-species" label="Especie" error={errors.species}>
            <input
              id="pet-species"
              className={`form-control ${errors.species ? "is-invalid" : ""}`}
              placeholder="Perro, gato..."
              list="pet-species-list"
              autoComplete="off"
              {...bind("species")}
            />
            <datalist id="pet-species-list">
              {SPECIES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </FormField>
          <FormField id="pet-birth" label="Fecha de nacimiento" error={errors.birthDate}>
            <input
              id="pet-birth"
              type="date"
              max={todayStr()}
              className={`form-control ${errors.birthDate ? "is-invalid" : ""}`}
              {...bind("birthDate")}
            />
          </FormField>
        </div>

        {errors.form && <p className="form-banner" role="alert">{errors.form}</p>}

        <button type="submit" className="modal__submit">Guardar registro</button>
      </form>
    </Modal>
  );
}