import { createContext, useContext } from "react";

// Cada rol puede registrar qué hace el botón principal de la barra superior
export const CtaContext = createContext({ onCta: null });
export const useCta = () => useContext(CtaContext);