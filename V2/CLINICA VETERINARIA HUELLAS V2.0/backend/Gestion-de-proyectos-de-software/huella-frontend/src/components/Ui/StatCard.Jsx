import { ChevronRight } from "lucide-react";

export default function StatCard({ label, value, icon: Icon, tone, foot }) {
  return (
    <article className="card stat">
      <span className={`stat__icon tone-${tone}`}>
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <div className="stat__body">
        <p className="stat__label">{label}</p>
        <p className="stat__value">{value}</p>
        <p className="stat__foot">
          {foot.prefix}
          <b className={`c-${foot.color}`}>{foot.highlight}</b>
          {foot.suffix}
        </p>
      </div>
      <button className="chev-btn" aria-label={`Ver ${label}`}>
        <ChevronRight size={16} />
      </button>
    </article>
  );
}