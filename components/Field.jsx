export default function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </label>
  );
}
