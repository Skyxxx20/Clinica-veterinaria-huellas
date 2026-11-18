import { CalendarCheck } from "lucide-react";
import { getSession } from "../../services/session";
import { navConfig } from "../layout/navConfig";
import { greeting, shiftName, formatToday } from "../../utils/dates";

export default function PageHeader({ name, subtitle }) {
  const now = new Date();
  const user = getSession()?.user;
  const config = navConfig[user?.roleKey];

  return (
    <header className="page-head">
      <div>
        <h1>
          {config?.greeting ?? greeting(now.getHours())}, {name ?? user?.name ?? "equipo"}.
        </h1>
        <p>{subtitle ?? config?.subtitle}</p>
      </div>
      <div className="date-pill">
        <CalendarCheck size={20} strokeWidth={1.6} />
        <span>
          <b>{formatToday(now)}</b> · {shiftName(now.getHours())}
        </span>
      </div>
    </header>
  );
}