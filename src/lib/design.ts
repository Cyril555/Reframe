export const colors = {
  safe: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  amber: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", icon: "text-amber-500" },
  red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", icon: "text-red-500" },
  challenge: { bg: "bg-slate-800", border: "border-slate-600", text: "text-slate-100" },
  strong: "text-emerald-600",
  moderate: "text-amber-600",
  limited: "text-red-600",
};

export function getScoreBand(score: number): "safe" | "amber" | "red" {
  if (score < 40) return "safe";
  if (score < 70) return "amber";
  return "red";
}
