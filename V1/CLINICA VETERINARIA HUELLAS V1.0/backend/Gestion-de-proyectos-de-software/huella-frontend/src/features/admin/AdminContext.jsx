import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { CtaContext } from "../../components/layout/CtaContext.jsx";
import { formatSendLabel } from "../../utils/dates";
import { ALERT_TYPES, BASE_PENDING, scheduledAlerts } from "./alertsData";
import CreateAlertModal from "./CreateAlertModal.jsx";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [alerts, setAlerts] = useState(scheduledAlerts);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  const openCreateAlert = useCallback(() => setModalOpen(true), []);
  const closeCreateAlert = useCallback(() => setModalOpen(false), []);

  const sendNow = useCallback(
    (id) => setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, sent: true } : a))),
    []
  );

  const createAlert = useCallback(({ pet, owner, type, message, sendAt }) => {
    const meta = ALERT_TYPES[type];
    setAlerts((prev) => [
      {
        id: `new-${Date.now()}`,
        title: meta.title(pet),
        owner,
        when: formatSendLabel(sendAt),
        type: meta.label,
        icon: meta.icon,
        tone: meta.tone,
        message,
        sent: false,
        isNew: true,
      },
      ...prev,
    ]);
    setModalOpen(false);
    setToast("Notificación creada y programada");
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Pendientes = base + creadas − enviadas
  const pendingCount =
    BASE_PENDING + alerts.filter((a) => a.isNew).length - alerts.filter((a) => a.sent).length;

  const value = useMemo(
    () => ({ alerts, pendingCount, sendNow, openCreateAlert }),
    [alerts, pendingCount, sendNow, openCreateAlert]
  );
  const cta = useMemo(() => ({ onCta: openCreateAlert }), [openCreateAlert]);

  return (
    <AdminContext.Provider value={value}>
      <CtaContext.Provider value={cta}>
        {children}
        <CreateAlertModal open={modalOpen} onClose={closeCreateAlert} onSave={createAlert} />
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </CtaContext.Provider>
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin debe usarse dentro de <AdminProvider>");
  return ctx;
}