const pad = (n) => String(n).padStart(2, "0");

export const greeting = (h) =>
  h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";

export const shiftName = (h) =>
  h < 14 ? "Turno mañana" : h < 22 ? "Turno tarde" : "Turno noche";

export function formatToday(date = new Date()) {
  const txt = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

// "2026-06-18T16:00" (datetime-local) → "Envío hoy, 4:00 PM"
export function formatSendLabel(value) {
  const d = new Date(value);
  const raw = new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  const time = `${raw.split(/\s/)[0]} ${/p/i.test(raw) ? "PM" : "AM"}`;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return `Envío hoy, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Envío mañana, ${time}`;

  const month = new Intl.DateTimeFormat("es-CO", { month: "long" }).format(d);
  return `Envío ${d.getDate()} de ${month}, ${time}`;
}

/* ───────── Formularios ───────── */

// "YYYY-MM-DD" de hoy en hora local
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// "HH:mm" actual
export const nowHHmm = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Próximo cuarto de hora, "HH:mm"
export const nextQuarterHour = () => {
  const d = new Date();
  d.setMinutes(Math.ceil((d.getMinutes() + 1) / 15) * 15, 0, 0);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Días entre hoy y una fecha "YYYY-MM-DD" (negativo si es pasada)
export const daysFromToday = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const t = new Date();
  const a = Date.UTC(y, m - 1, d);
  const b = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((a - b) / 86400000);
};

// "15:20" → "03:20"
export const to12h = (time24) => {
  const h = Number(time24.slice(0, 2));
  return `${pad(h % 12 || 12)}${time24.slice(2, 5)}`;
};

// Edad a partir de fecha de nacimiento "YYYY-MM-DD"
export function ageFromBirthDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const now = new Date();
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (now.getDate() < d) months -= 1;
  if (months < 0) months = 0;
  if (months < 12) return months === 1 ? "1 mes" : `${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 año" : `${years} años`;
}

export const ageFromYears = (n) =>
  n === 0 ? "Menos de 1 año" : n === 1 ? "1 año" : `${n} años`;

/* ───────── Fechas para registros clínicos ───────── */

// Fecha "YYYY-MM-DD" desplazada N días desde hoy
export const offsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

// "2026-06-18" → { day: "18", month: "JUN", year: "2026" }
export const dateParts = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  return { day, month: MONTHS[Number(month) - 1], year };
};

// "2026-06-03" → "03 jun 2026"
export const formatDoseDate = (dateStr) => {
  const { day, month, year } = dateParts(dateStr);
  return `${day} ${month.toLowerCase()} ${year}`;
};