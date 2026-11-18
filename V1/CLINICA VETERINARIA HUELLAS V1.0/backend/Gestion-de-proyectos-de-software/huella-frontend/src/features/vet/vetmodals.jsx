import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import FormField from "../../components/ui/FormField.jsx";
import PatientField from "../patients/PatientField.jsx";
import { resolvePatient } from "../patients/patientLookup";
import { usePatients } from "../../services/patientsStore";
import { todayStr } from "../../utils/dates";

/* Estado de formulario compartido por los tres modales */
function useModalForm(open, initial) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial);
      setErrors({});
    }
  }, [open, initial]);

  const bind = (field) => ({
    value: form[field],
    onChange: (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    },
  });

  return { form, errors, setErrors, bind };
}

function Header({ id, title }) {
  return (
    <>
      <span className="modal__icon">
        <FileText size={22} strokeWidth={1.7} />
      </span>
      <h2 className="modal__title" id={id}>{title}</h2>
      <p className="modal__subtitle">Completa la información para guardar el registro en Huella.</p>
    </>
  );
}

/* ───────── Crear historia clínica ───────── */
const EMPTY_RECORD = { patient: "", reason: "", diagnosis: "" };

export function RecordModal({ open, onClose, onSave }) {
  const patients = usePatients();
  const { form, errors, setErrors, bind } = useModalForm(open, EMPTY_RECORD);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    const resolved = resolvePatient(patients, form.patient);
    if (resolved.error) next.patient = resolved.error;
    if (form.reason.trim().length < 3) next.reason = "Escribe el motivo de la consulta";
    if (form.diagnosis.trim().length < 10) {
      next.diagnosis = "Describe hallazgos, diagnóstico y plan (mínimo 10 caracteres)";
    }
    if (Object.keys(next).length) return setErrors(next);

    onSave({
      patient: resolved.patient,
      reason: form.reason.trim(),
      diagnosis: form.diagnosis.trim(),
    });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="record-title">
      <Header id="record-title" title="Crear historia clínica" />
      <form onSubmit={handleSubmit} noValidate>
        <PatientField id="record-patient" error={errors.patient} {...bind("patient")} />

        <FormField id="record-reason" label="Motivo de consulta" error={errors.reason}>
          <input
            id="record-reason"
            className={`form-control ${errors.reason ? "is-invalid" : ""}`}
            placeholder="Motivo principal"
            autoComplete="off"
            {...bind("reason")}
          />
        </FormField>

        <FormField id="record-diagnosis" label="Historia y diagnóstico" error={errors.diagnosis}>
          <textarea
            id="record-diagnosis"
            className={`form-control ${errors.diagnosis ? "is-invalid" : ""}`}
            placeholder="Hallazgos, diagnóstico y plan de tratamiento..."
            {...bind("diagnosis")}
          />
        </FormField>

        <button type="submit" className="modal__submit">Guardar registro</button>
      </form>
    </Modal>
  );
}

/* ───────── Crear receta médica ───────── */
const EMPTY_RX = { patient: "", medication: "", instructions: "" };

export function PrescriptionModal({ open, onClose, onSave }) {
  const patients = usePatients();
  const { form, errors, setErrors, bind } = useModalForm(open, EMPTY_RX);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    const resolved = resolvePatient(patients, form.patient);
    if (resolved.error) next.patient = resolved.error;
    if (form.medication.trim().length < 3) next.medication = "Indica el medicamento y su concentración";
    if (form.instructions.trim().length < 5) next.instructions = "Indica dosis, frecuencia y duración";
    if (Object.keys(next).length) return setErrors(next);

    onSave({
      patient: resolved.patient,
      medication: form.medication.trim(),
      instructions: form.instructions.trim(),
    });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="rx-title">
      <Header id="rx-title" title="Crear receta médica" />
      <form onSubmit={handleSubmit} noValidate>
        <PatientField id="rx-patient" error={errors.patient} {...bind("patient")} />

        <FormField id="rx-medication" label="Medicamento" error={errors.medication}>
          <input
            id="rx-medication"
            className={`form-control ${errors.medication ? "is-invalid" : ""}`}
            placeholder="Medicamento y concentración"
            autoComplete="off"
            {...bind("medication")}
          />
        </FormField>

        <FormField id="rx-instructions" label="Prescripción" error={errors.instructions}>
          <textarea
            id="rx-instructions"
            className={`form-control ${errors.instructions ? "is-invalid" : ""}`}
            placeholder="Dosis, frecuencia y duración..."
            {...bind("instructions")}
          />
        </FormField>

        <button type="submit" className="modal__submit">Guardar registro</button>
      </form>
    </Modal>
  );
}

/* ───────── Registrar vacuna ───────── */
const EMPTY_VACCINE = { patient: "", vaccine: "", appliedAt: "", nextDoseAt: "" };

export function VaccineModal({ open, onClose, onSave }) {
  const patients = usePatients();
  const { form, errors, setErrors, bind } = useModalForm(open, EMPTY_VACCINE);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    const resolved = resolvePatient(patients, form.patient);
    if (resolved.error) next.patient = resolved.error;
    if (form.vaccine.trim().length < 3) next.vaccine = "Indica el nombre de la vacuna y el lote";

    if (!form.appliedAt) next.appliedAt = "Indica la fecha de aplicación";
    else if (form.appliedAt > todayStr()) next.appliedAt = "No puede ser una fecha futura";

    if (!form.nextDoseAt) next.nextDoseAt = "Indica la próxima dosis";
    else if (form.appliedAt && form.nextDoseAt <= form.appliedAt) {
      next.nextDoseAt = "Debe ser posterior a la aplicación";
    }
    if (Object.keys(next).length) return setErrors(next);

    onSave({
      patient: resolved.patient,
      vaccine: form.vaccine.trim(),
      appliedAt: form.appliedAt,
      nextDoseAt: form.nextDoseAt,
    });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="vaccine-title">
      <Header id="vaccine-title" title="Registrar vacuna" />
      <form onSubmit={handleSubmit} noValidate>
        <PatientField id="vaccine-patient" error={errors.patient} {...bind("patient")} />

        <FormField id="vaccine-name" label="Vacuna aplicada" error={errors.vaccine}>
          <input
            id="vaccine-name"
            className={`form-control ${errors.vaccine ? "is-invalid" : ""}`}
            placeholder="Nombre y lote"
            autoComplete="off"
            {...bind("vaccine")}
          />
        </FormField>

        <div className="form-row">
          <FormField id="vaccine-applied" label="Fecha de aplicación" error={errors.appliedAt}>
            <input
              id="vaccine-applied"
              type="date"
              max={todayStr()}
              className={`form-control ${errors.appliedAt ? "is-invalid" : ""}`}
              {...bind("appliedAt")}
            />
          </FormField>
          <FormField id="vaccine-next" label="Próxima dosis" error={errors.nextDoseAt}>
            <input
              id="vaccine-next"
              type="date"
              min={form.appliedAt || undefined}
              className={`form-control ${errors.nextDoseAt ? "is-invalid" : ""}`}
              {...bind("nextDoseAt")}
            />
          </FormField>
        </div>

        <button type="submit" className="modal__submit">Guardar registro</button>
      </form>
    </Modal>
  );
}