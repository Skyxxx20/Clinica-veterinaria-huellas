import { useMemo } from "react";
import FormField from "../../components/ui/FormField.jsx";
import { usePatients } from "../../services/patientsStore";
import { buildPatientOptions } from "./patientLookup";

export default function PatientField({ id, label = "Paciente", value, onChange, error }) {
  const patients = usePatients();
  const options = useMemo(() => buildPatientOptions(patients), [patients]);

  return (
    <FormField id={id} label={label} error={error}>
      <input
        id={id}
        className={`form-control ${error ? "is-invalid" : ""}`}
        placeholder="Buscar mascota o propietario"
        list={`${id}-list`}
        autoComplete="off"
        data-autofocus
        value={value}
        onChange={onChange}
      />
      <datalist id={`${id}-list`}>
        {options.map((o) => (
          <option key={o.value} value={o.value} />
        ))}
      </datalist>
    </FormField>
  );
}