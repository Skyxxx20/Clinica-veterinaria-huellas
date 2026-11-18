import { Heart, PawPrint } from "lucide-react";

export const featuredPet = { name: "Nala", breed: "Golden retriever · 3 años" };

export const nextAppointment = {
  day: "21",
  month: "JUN",
  title: "Control general de Nala",
  when: "10:30 AM · Dra. Laura Vélez",
  where: "Clínica Huella · Consultorio 3",
  countdown: "En 3 días",
};

export const healthPlan = {
  progress: 82,
  items: [
    { id: 1, label: "Vacuna múltiple", status: "Completada", done: true },
    { id: 2, label: "Desparasitación", status: "Completada", done: true },
    { id: 3, label: "Control dental", status: "Agosto", done: false },
  ],
};

export const reminders = [
  { id: 1, title: "Renovar antipulgas", detail: "Recomendado para esta semana",
    icon: Heart, tone: "rose" },
  { id: 2, title: "Historial de Nala", detail: "6 consultas registradas",
    icon: PawPrint, tone: "blue", to: "/propietario/historial" },
];

export const pets = [
  { id: 1, name: "Nala", initials: "NA", tone: "mint", breed: "Golden retriever · 3 años",
    next: "Control · 21 de junio" },
  { id: 2, name: "Kira", initials: "KI", tone: "lilac", breed: "Gata mestiza · 5 años",
    next: "Vacuna · 28 de junio" },
];

// status: "confirmed" | "pending"
export const appointments = [
  { id: 1, day: "21", month: "JUN", pet: "Nala", title: "Control general",
    when: "10:30 AM · Dra. Laura Vélez", status: "confirmed", requested: null },
  { id: 2, day: "28", month: "JUN", pet: "Kira", title: "Vacunación anual",
    when: "03:00 PM · Dr. Mateo Silva", status: "pending", requested: null },
];

export const history = [
  { id: 1, day: "18", month: "JUN", year: "2025", pet: "Nala", vet: "Dra. Laura Vélez",
    title: "Control preventivo",
    summary: "Paciente en buen estado general. Peso estable y signos vitales normales." },
  { id: 2, day: "02", month: "MAY", year: "2025", pet: "Kira", vet: "Dr. Mateo Silva",
    title: "Consulta digestiva",
    summary: "Evolución favorable. Se recomienda continuar dieta gastrointestinal durante 7 días." },
  { id: 3, day: "14", month: "MAR", year: "2025", pet: "Nala", vet: "Dra. Laura Vélez",
    title: "Limpieza dental",
    summary: "Procedimiento completado sin complicaciones. Control anual recomendado." },
];

export const prescriptions = [
  { id: 1, pet: "Nala", title: "Meloxicam 1 mg", detail: "1 tableta cada 24 horas · 5 días",
    meta: "Dra. Laura Vélez · Vigente hasta 23 jun", active: true },
  { id: 2, pet: "Kira", title: "Probiótico veterinario", detail: "1 sobre diario con alimento · 7 días",
    meta: "Dr. Mateo Silva · Vigente hasta 25 jun", active: true },
  { id: 3, pet: "Nala", title: "Antiparasitario oral", detail: "Dosis única según peso",
    meta: "Dra. Laura Vélez · Finalizada · 12 mar", active: false },
];