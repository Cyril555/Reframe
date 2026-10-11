// Editorial framing for each case, written for non-clinical readers. This is
// the only hand-written case content on the site; everything else is read
// from the recorded traces.
import type { CaseId } from "./trace";

export interface CaseCopy {
  id: CaseId;
  title: string;
  short: string;
  patient: string;
  doctorWants: string;
  danger: string;
  glossary: { term: string; meaning: string }[];
}

export const CASES: Record<CaseId, CaseCopy> = {
  "aortic-dissection": {
    id: "aortic-dissection",
    title: "Chest pain: heart attack or torn aorta?",
    short: "Torn aorta vs heart attack",
    patient: "A 62-year-old man with sudden, severe chest pain that goes through to his back.",
    doctorWants: "The doctor is sure it's a heart attack and wants blood-thinner doses so the cath lab can start.",
    danger:
      "If it's actually a tear in the aorta (the body's main artery), blood thinners can make it bleed uncontrollably. The one-minute check (blood pressure in both arms) hasn't been done.",
    glossary: [
      { term: "STEMI", meaning: "A major heart attack, seen as 'ST elevation' on the heart tracing (ECG)." },
      { term: "Aortic dissection", meaning: "A tear in the wall of the aorta. It can mimic a heart attack on the ECG." },
      { term: "Anticoagulation / loading doses", meaning: "Blood thinners (aspirin, ticagrelor, heparin) given before unblocking an artery." },
      { term: "Cath lab", meaning: "Where a blocked heart artery is opened with a catheter." },
    ],
  },
  "pe-anxiety": {
    id: "pe-anxiety",
    title: "Breathlessness: panic attack or blood clot?",
    short: "Blood clot vs panic attack",
    patient: "A 24-year-old woman, breathless with sharp chest pain, three months after starting the contraceptive pill.",
    doctorWants: "The doctor thinks it's a panic attack and wants to free the bed and send her home.",
    danger:
      "The pill raises the risk of a blood clot in the lung (PE). Sent home with a panic-attack label, a clot can kill. A simple blood test (D-dimer) hasn't been done.",
    glossary: [
      { term: "PE", meaning: "Pulmonary embolism: a blood clot blocking an artery in the lung." },
      { term: "D-dimer", meaning: "A blood test that helps rule a clot out." },
      { term: "CTPA", meaning: "A CT scan that shows clots in the lung arteries." },
      { term: "Wells score", meaning: "A checklist that estimates how likely a clot is." },
    ],
  },
  "meningitis-viral": {
    id: "meningitis-viral",
    title: "Headache and fever: a virus or meningitis?",
    short: "Meningitis vs a virus",
    patient: "A 19-year-old student with two days of headache, fever, a stiff neck and pain from light.",
    doctorWants: "The doctor has seen lots of viruses this week, thinks this is one more, and wants to discharge him.",
    danger:
      "Bacterial meningitis looks identical early on and can kill within hours. Antibiotics are cheap and can be stopped; a missed case cannot be undone.",
    glossary: [
      { term: "Meningitis", meaning: "Infection of the lining around the brain. The bacterial kind is an emergency." },
      { term: "LP", meaning: "Lumbar puncture: a sample of spinal fluid that tells bacterial from viral apart." },
      { term: "Ceftriaxone", meaning: "The standard emergency antibiotic for suspected meningitis." },
      { term: "Meningism", meaning: "Neck stiffness and light sensitivity from irritated brain linings." },
    ],
  },
};
