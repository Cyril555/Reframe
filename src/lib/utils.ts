import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const signalLabels: Record<string, string> = {
  agreement_without_evidence: "Agreement without cited evidence",
  differential_narrowing: "Differential narrowed after your stated preference",
  position_drift: "Position reversed on pushback without new data",
  affirmation_language: "Excessive affirmation language detected",
  framing_echo: "AI echoed your diagnostic framing as its conclusion",
};
