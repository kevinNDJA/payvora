export default function ProBadge({ small = false, className = "" }) {
  const base = "inline-block uppercase tracking-widest bg-amber-100 text-amber-700 rounded-full font-mono";
  const size = small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return <span className={`${base} ${size} ${className}`}>PRO</span>;
}
