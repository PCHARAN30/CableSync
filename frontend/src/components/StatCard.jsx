import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "text-ink",
  linkTo,
}) {
  const content = (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border border-hairline bg-card p-3 sm:p-4 shadow-2xs transition-all ${
        linkTo ? "hover:border-brass/50 hover:shadow-xs" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-soft">
          {title}
        </span>
        {Icon && (
          <span className={`grid h-7 w-7 place-items-center rounded-lg bg-paper border border-hairline/60 ${color}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className={`text-xl sm:text-2xl font-bold tracking-tight font-sans ${color}`}>
          {value}
        </span>
        {subtitle && (
          <span className="text-[11px] text-ink-soft">{subtitle}</span>
        )}
      </div>

      {linkTo && (
        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-brass-dark opacity-80 group-hover:opacity-100">
          <span>View</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );

  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}

export default StatCard;

