import { demoUsers, DEMO_PASSWORD } from "../features/auth/demoUsers";
import { findAccount } from "./accounts";

export async function login(arg1, arg2) {
  const { email, password } =
    typeof arg1 === "string" ? { email: arg1, password: arg2 } : arg1 ?? {};

  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedPassword = String(password ?? "");

  await new Promise((r) => setTimeout(r, 600)); // simula latencia de red

  const demo = demoUsers.find((u) => u.email === normalizedEmail);
  if (demo && normalizedPassword === DEMO_PASSWORD) {
    return { token: "demo-token", user: demo };
  }

  const account = findAccount(normalizedEmail, normalizedPassword);
  if (account) return { token: "demo-token", user: account };

  throw new Error("Credenciales incorrectas");
}