import { APP_NAME } from "../constants";

export default function Watermark({ isPro, dark = false, mono = false }) {
  if (isPro) return null;
  return (
    <p
      className={`mt-8 pt-3 border-t border-dashed text-center text-[11px] tracking-wide ${
        dark ? "border-stone-700 text-stone-500" : "border-stone-200 text-stone-400"
      } ${mono ? "font-mono text-left" : ""}`}
    >
      {mono ? "// " : ""}Facture générée avec {APP_NAME} — payvora.app
    </p>
  );
}
