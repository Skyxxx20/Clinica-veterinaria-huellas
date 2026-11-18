export const normalize = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const digitsOnly = (s = "") => s.replace(/\D/g, "");

export const formatPhone = (s = "") => {
  const d = digitsOnly(s);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : s;
};

export const initialsOf = (fullName = "") =>
  fullName
    .replace(/^(dr|dra)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");