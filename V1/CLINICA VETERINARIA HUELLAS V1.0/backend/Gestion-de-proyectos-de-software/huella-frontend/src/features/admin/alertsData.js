import { Bell, PawPrint, CalendarCheck, Users, FileText, Phone } from "lucide-react";

export const BASE_PENDING = 14;

// Tipos de alerta del formulario "Crear notificación"
export const ALERT_TYPES = {
  vaccine: { label: "Vacuna", icon: PawPrint, tone: "mint", title: (pet) => `Vacuna de ${pet}` },
  appointment: { label: "Cita", icon: CalendarCheck, tone: "blue", title: (pet) => `Cita de ${pet}` },
  custom: { label: "Aviso", icon: Bell, tone: "rose", title: (pet) => `Aviso para ${pet}` },
};

export const stats = [
  { id: "pendientes", label: "Alertas pendientes", value: String(BASE_PENDING), icon: Bell, tone: "rose",
    foot: { highlight: "Requieren envío hoy", color: "success" } },
  { id: "vacunas", label: "Vacunas próximas", value: "8", icon: PawPrint, tone: "mint",
    foot: { prefix: "En los próximos ", highlight: "7 días", color: "ink" } },
  { id: "citas", label: "Citas por confirmar", value: "6", icon: CalendarCheck, tone: "blue",
    foot: { highlight: "3 para mañana", color: "success" } },
  { id: "familias", label: "Familias alcanzadas", value: "94%", icon: Users, tone: "lilac",
    foot: { prefix: "Durante este mes", highlight: "", color: "ink" } },
];

export const scheduledAlerts = [
  { id: 1, title: "Vacuna anual de Milo", owner: "Lucía Torres", when: "Envío hoy, 4:00 PM",
    type: "Vacuna", icon: PawPrint, tone: "mint", sent: false },
  { id: 2, title: "Confirmación de cita de Bruno", owner: "Daniel Rojas", when: "Envío hoy, 6:00 PM",
    type: "Cita", icon: CalendarCheck, tone: "blue", sent: false },
  { id: 3, title: "Refuerzo múltiple de Nala", owner: "Camila Ortega", when: "21 de junio",
    type: "Vacuna", icon: PawPrint, tone: "rose", sent: false },
];

export const channels = [
  { id: "email", label: "Correo electrónico", detail: "846 usuarios habilitados", icon: FileText },
  { id: "sms", label: "Mensaje SMS", detail: "792 números verificados", icon: Phone },
];