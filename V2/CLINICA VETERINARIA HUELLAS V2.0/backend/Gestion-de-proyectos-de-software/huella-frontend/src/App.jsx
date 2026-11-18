import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/LoginPage.jsx";
import ProtectedRoute from "./features/auth/ProtectedRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import AlertCenter from "./features/admin/AlertCenter.jsx";
import PatientsDirectory from "./features/patients/PatientsDirectory.jsx";
import OwnersDirectory from "./features/owners/OwnersDirectory.jsx";
import { ReceptionProvider } from "./features/reception/ReceptionContext.jsx";
import ReceptionDashboard from "./features/reception/ReceptionDashboard.jsx";
import AgendaPage from "./features/reception/AgendaPage.jsx";
import WaitingRoom from "./features/reception/WaitingRoom.jsx";
import VetDashboard from "./features/vet/VetDashboard.jsx";
import ClinicalRecords from "./features/vet/ClinicalRecords.jsx";
import Prescriptions from "./features/vet/Prescriptions.jsx";
import Vaccines from "./features/vet/Vaccines.jsx";
import OwnerHome from "./features/owners/ownerHome.jsx";
import MyPets from "./features/owners/MyPets.jsx";
import MyAppointments from "./features/owners/MyAppointments.jsx";
import MedicalHistory from "./features/owners/MedicalHistory.jsx";
import MyPrescriptions from "./features/owners/MyPrescriptions.jsx";
import { AdminProvider } from "./features/admin/AdminContext.jsx";
import { VetProvider } from "./features/vet/VetContext.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

            {/* Administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminProvider>
              <DashboardLayout />
            </AdminProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<AlertCenter />} />
        <Route path="pacientes" element={<PatientsDirectory />} />
      </Route>

      {/* Recepcionista */}
      <Route
        path="/recepcion"
        element={
          <ProtectedRoute roles={["reception"]}>
            <ReceptionProvider>
              <DashboardLayout />
            </ReceptionProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<ReceptionDashboard />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="sala-espera" element={<WaitingRoom />} />
        <Route path="mascotas" element={<PatientsDirectory />} />
        <Route path="usuarios" element={<OwnersDirectory />} />
      </Route>

          {/* Veterinario */}
      <Route
        path="/veterinario"
        element={
          <ProtectedRoute roles={["vet"]}>
            <VetProvider>
              <DashboardLayout />
            </VetProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<VetDashboard />} />
        <Route path="historias" element={<ClinicalRecords />} />
        <Route path="recetas" element={<Prescriptions />} />
        <Route path="vacunas" element={<Vaccines />} />
        <Route path="pacientes" element={<PatientsDirectory actionLabel="Historia clínica" />} />
      </Route>

      {/* Propietario */}
      <Route
        path="/propietario"
        element={
          <ProtectedRoute roles={["owner"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OwnerHome />} />
        <Route path="mascotas" element={<MyPets />} />
        <Route path="citas" element={<MyAppointments />} />
        <Route path="historial" element={<MedicalHistory />} />
        <Route path="recetas" element={<MyPrescriptions />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}