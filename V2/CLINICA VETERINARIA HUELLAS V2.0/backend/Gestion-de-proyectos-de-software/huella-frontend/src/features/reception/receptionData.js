import { CalendarCheck, Clock, Phone, Plus } from "lucide-react";

export const BASE_WAITING = 6;

export const stats = [
  { id: "citas", label: "Citas del turno", value: "24", icon: CalendarCheck, tone: "mint",
    foot: { highlight: "18", suffix: " confirmadas", color: "success" } },
  { id: "espera", label: "En sala de espera", value: String(BASE_WAITING), icon: Clock, tone: "blue",
    foot: { prefix: "Promedio ", highlight: "12 min", color: "ink" } },
  { id: "llamadas", label: "Llamadas pendientes", value: "3", icon: Phone, tone: "rose",
    foot: { highlight: "2", suffix: " devoluciones", color: "ink" } },
  { id: "registros", label: "Registros nuevos", value: "5", icon: Plus, tone: "lilac",
    foot: { highlight: "Hoy", color: "ink" } },
];

// status: "scheduled" | "waiting" | "in_consult" | "cancelled"
export const appointments = [
  // Hoy
  { id: 1, dayOffset: 0, time: "09:30", period: "AM", pet: "Milo", initials: "MI", tone: "mint",
    detail: "Vacunación · Gato", owner: "Lucía Torres", consultorio: "Consultorio 1", status: "in_consult" },
  { id: 2, dayOffset: 0, time: "10:15", period: "AM", pet: "Bruno", initials: "BR", tone: "blue",
    detail: "Control general · Perro", owner: "Daniel Rojas", consultorio: "Consultorio 2", status: "scheduled" },
  { id: 3, dayOffset: 0, time: "11:00", period: "AM", pet: "Luna", initials: "LU", tone: "peach",
    detail: "Dermatología · Perro", owner: "Sofía Márquez", consultorio: "Consultorio 3", status: "scheduled" },
  { id: 4, dayOffset: 0, time: "11:45", period: "AM", pet: "Coco", initials: "CO", tone: "lilac",
    detail: "Desparasitación · Conejo", owner: "Martín Vega", consultorio: "Consultorio 4", status: "scheduled" },

  // Próximos días (datos de ejemplo)
  { id: 5, dayOffset: 1, time: "08:45", period: "AM", pet: "Nala", initials: "NA", tone: "mint",
    detail: "Refuerzo múltiple · Perro", owner: "Camila Ortega", consultorio: "Consultorio 1", status: "scheduled" },
  { id: 6, dayOffset: 1, time: "10:00", period: "AM", pet: "Thor", initials: "TH", tone: "blue",
    detail: "Control general · Perro", owner: "Andrés Gil", consultorio: "Consultorio 2", status: "scheduled" },
  { id: 7, dayOffset: 2, time: "09:00", period: "AM", pet: "Mía", initials: "MA", tone: "lilac",
    detail: "Esterilización · Gato", owner: "Laura Pinto", consultorio: "Consultorio 3", status: "scheduled" },
  { id: 8, dayOffset: 2, time: "11:30", period: "AM", pet: "Rocky", initials: "RO", tone: "peach",
    detail: "Vacunación · Perro", owner: "Julián Mora", consultorio: "Consultorio 1", status: "scheduled" },
  { id: 9, dayOffset: 2, time: "15:20", period: "PM", pet: "Kira", initials: "KI", tone: "mint",
    detail: "Desparasitación · Perro", owner: "Paula Ríos", consultorio: "Consultorio 4", status: "scheduled" },
  { id: 10, dayOffset: 3, time: "10:30", period: "AM", pet: "Simba", initials: "SI", tone: "peach",
    detail: "Control general · Gato", owner: "Diego Solano", consultorio: "Consultorio 2", status: "scheduled" },
];

export const nextInLine = {
  pet: "Bruno",
  initials: "BR",
  tone: "blue",
  detail: "Control general · Consultorio 2",
  wait: "12 min",
};