import { normalize } from "../../Utils/text.js";

export const buildPatientOptions = (patients) =>
  patients.map((p) => ({ value: `${p.name} · ${p.owner}`, patient: p }));

// Acepta "Milo · Lucía Torres" o, si es único, solo "Milo" o "Lucía Torres"
export function resolvePatient(patients, text) {
  const q = normalize(text);
  if (!q) return { error: "Selecciona una mascota o propietario" };

  const exact = buildPatientOptions(patients).find((o) => normalize(o.value) === q);
  if (exact) return { patient: exact.patient };

  const matches = patients.filter(
    (p) => normalize(p.name) === q || normalize(p.owner) === q
  );
  if (matches.length === 1) return { patient: matches[0] };
  if (matches.length > 1) return { error: "Hay varias coincidencias: elige una de la lista" };
  return { error: "No encontramos ese paciente. Verifica en el directorio" };
}