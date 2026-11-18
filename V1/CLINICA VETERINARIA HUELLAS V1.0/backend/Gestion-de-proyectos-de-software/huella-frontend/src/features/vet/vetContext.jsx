import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { useLocation } from "react-router-dom";
import { CtaContext } from "../../components/layout/CtaContext.jsx";
import { dateParts, todayStr } from "../../utils/dates";
import { normalize } from "../../Utils/text.js";
import {
  records as seedRecords,
  prescriptions as seedPrescriptions,
  vaccines as seedVaccines,
} from "./vetData";
import { RecordModal, PrescriptionModal, VaccineModal } from "./VetModals.jsx";

const VetContext = createContext(null);

export function VetProvider({ children }) {
  const { pathname } = useLocation();
  const [records, setRecords] = useState(seedRecords);
  const [prescriptions, setPrescriptions] = useState(seedPrescriptions);
  const [vaccines, setVaccines] = useState(seedVaccines);
  const [modal, setModal] = useState(null); // "record" | "prescription" | "vaccine" | null
  const [toast, setToast] = useState("");

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const done = useCallback((message) => {
    setModal(null);
    setToast(message);
  }, []);

  const addRecord = useCallback(
    ({ patient, reason, diagnosis }) => {
      const { day, month, year } = dateParts(todayStr());
      setRecords((prev) => [
        {
          id: `new-${Date.now()}`,
          day, month, year,
          pet: patient.name,
          owner: patient.owner,
          title: reason,
          summary: diagnosis,
        },
        ...prev,
      ]);
      done("Historia clínica creada");
    },
    [done]
  );

  const addPrescription = useCallback(
    ({ patient, medication, instructions }) => {
      setPrescriptions((prev) => [
        {
          id: `new-${Date.now()}`,
          pet: patient.name,
          owner: patient.owner,
          title: medication,
          detail: instructions,
        },
        ...prev,
      ]);
      done("Receta creada");
    },
    [done]
  );

  // Si la mascota ya tiene esa vacuna, se actualiza su última y próxima dosis
  const addVaccine = useCallback(
    ({ patient, vaccine, appliedAt, nextDoseAt }) => {
      setVaccines((prev) => {
        const idx = prev.findIndex(
          (v) =>
            v.pet === patient.name &&
            v.owner === patient.owner &&
            normalize(v.vaccine) === normalize(vaccine)
        );
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], last: appliedAt, next: nextDoseAt };
          return copy;
        }
        return [
          {
            id: `new-${Date.now()}`,
            pet: patient.name,
            initials: patient.initials,
            owner: patient.owner,
            vaccine,
            last: appliedAt,
            next: nextDoseAt,
          },
          ...prev,
        ];
      });
      done("Vacuna registrada");
    },
    [done]
  );

  const removeRecord = useCallback(
    (id) => setRecords((prev) => prev.filter((r) => r.id !== id)),
    []
  );

  // Botón principal de la barra según la ruta
  const kind = pathname.startsWith("/veterinario/recetas")
    ? "prescription"
    : pathname.startsWith("/veterinario/vacunas")
    ? "vaccine"
    : "record";
  const cta = useMemo(() => ({ onCta: () => setModal(kind) }), [kind]);

  const value = useMemo(
    () => ({ records, prescriptions, vaccines, removeRecord }),
    [records, prescriptions, vaccines, removeRecord]
  );

  return (
    <VetContext.Provider value={value}>
      <CtaContext.Provider value={cta}>
        {children}
        <RecordModal open={modal === "record"} onClose={closeModal} onSave={addRecord} />
        <PrescriptionModal open={modal === "prescription"} onClose={closeModal} onSave={addPrescription} />
        <VaccineModal open={modal === "vaccine"} onClose={closeModal} onSave={addVaccine} />
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </CtaContext.Provider>
    </VetContext.Provider>
  );
}

export function useVet() {
  const ctx = useContext(VetContext);
  if (!ctx) throw new Error("useVet debe usarse dentro de <VetProvider>");
  return ctx;
}