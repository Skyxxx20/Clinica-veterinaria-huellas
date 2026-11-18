import { demoUsers } from "../features/auth/demoUsers.js";
import { initialsOf } from "../Utils/text.js";

const accounts = [];

export const emailTaken = (email) =>
  [...demoUsers, ...accounts.map((a) => a.user)].some(
    (u) => u.email === email.trim().toLowerCase()
  );

export function createOwnerAccount({ fullName, email, password }) {
  const user = {
    initials: initialsOf(fullName),
    name: fullName.trim().split(/\s+/)[0],
    fullName: fullName.trim(),
    role: "Propietario",
    roleKey: "owner",
    email: email.trim().toLowerCase(),
    home: "/propietario",
  };
  accounts.push({ user, password });
  return user;
}

export const findAccount = (email, password) =>
  accounts.find((a) => a.user.email === email && a.password === password)?.user ?? null;