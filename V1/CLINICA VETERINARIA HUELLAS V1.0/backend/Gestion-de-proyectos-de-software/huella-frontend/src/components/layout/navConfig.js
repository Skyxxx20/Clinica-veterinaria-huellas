import {
  Bell, PawPrint, LayoutGrid, CalendarCheck, Clock, Users, FileText, Heart,
} from "lucide-react";

export const navConfig = {
    admin: {
    cta: "Nueva alerta",
    showNotifications: false,
    subtitle: "Envía avisos de citas y vacunas a las familias de Huella.",
    searchPlaceholder: "Buscar mascota o propietario...",
    groups: [

      {
        title: "Gestión",
        items: [
          { to: "/admin", label: "Centro de alertas", icon: Bell, end: true },
          { to: "/admin/pacientes", label: "Directorio de pacientes", icon: PawPrint },
        ],
      },
    ],
  },

  reception: {
    cta: "Registrar cita",
    showNotifications: false,
    subtitle: "Gestiona las llegadas, llamadas y citas del turno actual.",
    searchPlaceholder: "Buscar mascota o propietario...",
    groups: [
      {
        title: "Gestión",
        items: [
          { to: "/recepcion", label: "Mi turno", icon: LayoutGrid, end: true },
          { to: "/recepcion/agenda", label: "Agenda y calendario", icon: CalendarCheck },
          { to: "/recepcion/sala-espera", label: "Sala de espera", icon: Clock },
          { to: "/recepcion/mascotas", label: "Mascotas", icon: PawPrint, cta: "Registrar mascota" },
          { to: "/recepcion/usuarios", label: "Usuarios", icon: Users, cta: "Registrar usuario" },
        ],
      },
    ],
  },

  vet: {
    cta: "Nueva historia",
    showNotifications: false,
    subtitle: "Consulta pacientes y mantén su información clínica al día.",
    searchPlaceholder: "Buscar mascota o propietario...",
    groups: [
      {
        title: "Gestión",
        items: [
          { to: "/veterinario", label: "Mis consultas", icon: LayoutGrid, end: true },
          { to: "/veterinario/historias", label: "Historias clínicas", icon: FileText },
          { to: "/veterinario/recetas", label: "Recetas médicas", icon: Heart, cta: "Nueva receta" },
          { to: "/veterinario/vacunas", label: "Vacunas", icon: PawPrint, cta: "Registrar vacuna" },
          { to: "/veterinario/pacientes", label: "Directorio de pacientes", icon: Users },
        ],
      },
    ],
  },

  owner: {
    cta: "Agendar cita",
    greeting: "Hola",
    subtitle: "Todo lo que necesitas para cuidar la salud de tus mascotas.",
    searchPlaceholder: "Buscar en mis mascotas...",
    groups: [
      {
        title: "Mi cuenta",
        items: [
          { to: "/propietario", label: "Inicio", icon: LayoutGrid, end: true },
          { to: "/propietario/mascotas", label: "Mis mascotas", icon: PawPrint },
          { to: "/propietario/citas", label: "Mis citas", icon: CalendarCheck },
          { to: "/propietario/historial", label: "Historial médico", icon: Heart },
          { to: "/propietario/recetas", label: "Recetas médicas", icon: FileText },
        ],
      },
    ],
  },
};