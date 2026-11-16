const KEY = "huella_session";

export function saveSession(session, remember = false) {
  clearSession();
  (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}