import { useSyncExternalStore } from "react";
import { patients as seed } from "../features/patients/patientsData.js";
import { digitsOnly, formatPhone, normalize } from "../Utils/text.js";

const TONES = ["mint", "blue", "peach", "lilac"];

let patients = seed;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const patientsStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => patients,

  hasPet: (owner, name) =>
    patients.some((p) => normalize(p.owner) === normalize(owner) && normalize(p.name) === normalize(name)),

  phoneTaken: (phone) => patients.some((p) => digitsOnly(p.phone) === digitsOnly(phone)),

  addPatient({ name, species, age, owner, phone, email, sex, breed }) {
    const id = patients.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const record = {
      id,
      name,
      initials: name.slice(0, 2).toUpperCase(),
      tone: TONES[id % TONES.length],
      species,
      age,
      owner,
      phone: formatPhone(phone),
      email,
      sex,
      breed,
    };
    patients = [...patients, record];
    emit();
    return record;
  },
};

export const usePatients = () =>
  useSyncExternalStore(patientsStore.subscribe, patientsStore.getSnapshot);