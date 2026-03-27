import { aorticDissectionScenario } from "./scenarios/nstemi-wellens";
import { peAnxietyScenario } from "./scenarios/pe-anxiety";
import { meningitisViralScenario } from "./scenarios/meningitis-viral";
import { Scenario } from "@/types/scenario";

export const scenarios: Scenario[] = [
  aorticDissectionScenario,
  peAnxietyScenario,
  meningitisViralScenario,
];

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
