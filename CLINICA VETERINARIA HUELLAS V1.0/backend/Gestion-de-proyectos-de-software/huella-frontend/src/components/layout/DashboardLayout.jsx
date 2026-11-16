import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { SearchProvider } from "./SearchContext.jsx";
import "../ui/ui.css";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  return (
    <SearchProvider>
      <div className="shell">
        <Sidebar />
        <div className="shell__main">
          <Topbar />
          <main className="shell__content">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}