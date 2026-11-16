import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { useLocation } from "react-router-dom";
import { CtaContext } from "../../components/layout/CtaContext.jsx";
import { patientsStore } from "../../services/patientsStore";
import { createOwnerAccount, emailTaken } from "../../services/accounts";
import { ageFromBirthDate, ageFromYears, daysFromToday } from "../../utils/dates";
import { normalize } from "../../Utils/text.js";
import { appointments as initialAppointments, BASE_WAITING } from "./receptionData";
import AppointmentModal from "./AppointmentModal.jsx";
import PetModal from "./PetModal.jsx";
import OwnerModal from "./OwnerModal.jsx";

const ROOMS = ["Consultorio 1", "Consultorio 2", "Consultorio 3", "Consultorio 4"];
const DURATION = 30; // minutos
const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

const ReceptionContext = createContext(null);

export function ReceptionProvider({ children }) {
  const { pathname } = useLocation();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [modal, setModal] = useState(null); // "appointment" | "pet" | "owner" | null
  const [toast, setToast] = useState("");
  const [registrations, setRegistrations] = useState(0);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ───── Citas ───── */
  const addAppointment = useCallback(
    ({ patient, date, time }) => {
      const dayOffset = daysFromToday(date);
      const start = toMin(time);

      const overlapping = appointments.filter(
        (a) =>
          a.dayOffset === dayOffset &&
          a.status !== "cancelled" &&
          start < toMin(a.time) + DURATION &&
          start + DURATION > toMin(a.time)
      );

      if (overlapping.some((a) => a.pet === patient.name && a.owner === patient.owner)) {
        return { ok: false, error: "La mascota ya tiene una cita en ese horario" };
      }
      const used = overlapping.map((a) => a.consultorio);
      const room = ROOMS.find((r) => !used.includes(r));
      if (!room) {
        return { ok: false, error: "No hay consultorios disponibles en ese horario" };
      }

      setAppointments((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          dayOffset,
          time,
          period: Number(time.slice(0, 2)) >= 12 ? "PM" : "AM",
          pet: patient.name,
          initials: patient.initials,
          tone: patient.tone,
          detail: `Consulta general · ${patient.species}`,
          owner: patient.owner,
          consultorio: room,
          status: "confirmed",
          isNew: true,
        },
      ]);
      setModal(null);
      setToast("Cita programada");
      return { ok: true };
    },
    [appointments]
  );

  /* ───── Mascotas y usuarios ───── */
  const registerPet = useCallback(({ name, owner, species, birthDate }) => {
    if (patientsStore.hasPet(owner, name)) {
      return { ok: false, field: "name", error: "Ese propietario ya tiene una mascota con ese nombre" };
    }
    const ref = patientsStore
      .getSnapshot()
      .find((p) => normalize(p.owner) === normalize(owner));

    patientsStore.addPatient({
      name,
      species,
      age: ageFromBirthDate(birthDate),
      owner: ref.owner,
      phone: ref.phone,
      email: ref.email,
    });
    setRegistrations((n) => n + 1);
    setModal(null);
    setToast("Mascota registrada");
    return { ok: true };
  }, []);

  const registerOwner = useCallback((data) => {
    if (patientsStore.phoneTaken(data.phone)) {
      return { ok: false, field: "phone", error: "Ya existe un propietario con ese número" };
    }
    if (emailTaken(data.email)) {
      return { ok: false, field: "email", error: "Ya existe una cuenta con ese correo" };
    }
    createOwnerAccount({ fullName: data.fullName, email: data.email, password: data.password });
    patientsStore.addPatient({
      name: data.petName,
      species: data.petType,
      age: ageFromYears(data.ageYears),
      owner: data.fullName,
      phone: data.phone,
      email: data.email,
      sex: data.sex,
      breed: data.breed,
    });
    setRegistrations((n) => n + 1);
    setModal(null);
    setToast("Usuario registrado");
    return { ok: true };
  }, []);

  /* ───── Botón principal de la barra según la ruta ───── */
  const kind = pathname.startsWith("/recepcion/mascotas")
    ? "pet"
    : pathname.startsWith("/recepcion/usuarios")
    ? "owner"
    : "appointment";
  const cta = useMemo(() => ({ onCta: () => setModal(kind) }), [kind]);

  const value = useMemo(() => {
    const patch = (id, changes) =>
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));

    const today = appointments
      .filter((a) => a.dayOffset === 0 && a.status !== "cancelled")
      .sort((a, b) => a.time.localeCompare(b.time));

    return {
      appointments,
      today,
      waitingCount: BASE_WAITING + today.filter((a) => a.status === "waiting").length,
      addedToday: today.filter((a) => a.isNew).length,
      registrationsToday: registrations,
      registerArrival: (id) => patch(id, { status: "waiting" }),
      cancelAppointment: (id) => patch(id, { status: "cancelled" }),
    };
  }, [appointments, registrations]);

  return (
    <ReceptionContext.Provider value={value}>
      <CtaContext.Provider value={cta}>
        {children}
        <AppointmentModal open={modal === "appointment"} onClose={closeModal} onSave={addAppointment} />
        <PetModal open={modal === "pet"} onClose={closeModal} onSave={registerPet} />
        <OwnerModal open={modal === "owner"} onClose={closeModal} onSave={registerOwner} />
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </CtaContext.Provider>
    </ReceptionContext.Provider>
  );
}

export function useReception() {
  const ctx = useContext(ReceptionContext);
  if (!ctx) throw new Error("useReception debe usarse dentro de <ReceptionProvider>");
  return ctx;
}