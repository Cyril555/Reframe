import { AgentDebate } from "@/types/debate";

// Keyed by ConversationTurn id
const debates: Record<string, AgentDebate> = {
  // ─── NSTEMI vs Wellens (turn nw-2, score 68) ───────────────────────────
  "nw-2": {
    agents: [
      {
        id: "nstemi",
        name: "NSTEMI Advocate",
        diagnosis: "NSTEMI",
        color: "blue",
        icon: "🔵",
        side: "left",
      },
      {
        id: "wellens",
        name: "Wellens Advocate",
        diagnosis: "Wellens Syndrome",
        color: "purple",
        icon: "🟣",
        side: "right",
      },
      {
        id: "judge",
        name: "Judge",
        diagnosis: "Impartial Review",
        color: "teal",
        icon: "⚖️",
        side: "left",
      },
    ],
    messages: [
      {
        agentId: "nstemi",
        content:
          "Troponin at the 99th percentile with two days of ischaemic chest pain — this is ACS until proven otherwise. The ESC NSTEMI pathway is unambiguous here.",
      },
      {
        agentId: "wellens",
        content:
          "The troponin is borderline by design in Wellens. Critical LAD stenosis causes pain that resolves before infarction completes. A near-normal troponin doesn't exclude it — it's a feature, not evidence against.",
      },
      {
        agentId: "nstemi",
        content:
          "T-wave inversions in V2-V3 are consistent with anterior ischaemia from any cause. You need more than an ECG pattern to diagnose Wellens.",
      },
      {
        agentId: "wellens",
        content:
          "Deep symmetrical T-inversions in V2-V3 during a pain-free interval — that's not 'consistent with ischaemia', that's the Wellens Type B criteria. Sensitivity 69%, specificity 89%. This is a pattern diagnosis.",
      },
      {
        agentId: "nstemi",
        content:
          "Both diagnoses ultimately require angiography. The management overlap makes this distinction largely academic.",
      },
      {
        agentId: "wellens",
        content:
          "We are not splitting hairs. NSTEMI permits stress testing as a risk stratification step. Stress testing in Wellens precipitates anterior STEMI. That difference kills patients. It is not academic.",
      },
    ],
    verdict: {
      recommendation: "Wellens Syndrome (Type B)",
      confidence: "High",
      reasoning:
        "The Wellens Advocate identified the clinically decisive distinction. The ECG criteria for Wellens Type B are satisfied: symmetrical deep T-inversions in V2-V3 during a pain-free interval with borderline troponin. The critical management divergence — contraindication of stress testing — makes Wellens the only safe working diagnosis. The NSTEMI Advocate correctly noted angiography is required in both cases, but failed to account for the harm of the NSTEMI pathway's stress testing step.",
      immediateAction:
        "Urgent cardiology referral, serial ECGs, NO stress testing under any circumstances",
    },
  },

  // ─── PE vs Anxiety (turn pa-2, score 78) ───────────────────────────────
  "pa-2": {
    agents: [
      {
        id: "pe",
        name: "PE Advocate",
        diagnosis: "Pulmonary Embolism",
        color: "rose",
        icon: "🔴",
        side: "left",
      },
      {
        id: "anxiety",
        name: "Anxiety Advocate",
        diagnosis: "Panic / Anxiety",
        color: "blue",
        icon: "🔵",
        side: "right",
      },
      {
        id: "judge",
        name: "Judge",
        diagnosis: "Impartial Review",
        color: "teal",
        icon: "⚖️",
        side: "left",
      },
    ],
    messages: [
      {
        agentId: "pe",
        content:
          "Wells score minimum 2.5 — OCP is a confirmed thrombotic risk factor, tachycardia HR 110 adds 1.5 points. This patient requires D-dimer before any discharge decision. Full stop.",
      },
      {
        agentId: "anxiety",
        content:
          "She is 24 years old with a textbook panic presentation. Hyperventilation, chest tightness, rapid improvement with reassurance — these are the hallmarks of anxiety disorder, not PE.",
      },
      {
        agentId: "pe",
        content:
          "'Improvement with reassurance' is not a validated method to exclude pulmonary embolism. PE symptoms are dynamic. Young women on OCP are the most frequently missed PE demographic in emergency medicine.",
      },
      {
        agentId: "anxiety",
        content:
          "SpO2 is 96% — sub-massive PE typically produces worse hypoxia. Ordering a CTPA on every anxious young woman is not evidence-based medicine.",
      },
      {
        agentId: "pe",
        content:
          "Nobody is ordering a CTPA yet. We are asking for a D-dimer. If negative at low-intermediate risk — PE excluded, anxiety confirmed. That is the guideline-recommended pathway. Why are we arguing about skipping step one?",
      },
      {
        agentId: "anxiety",
        content:
          "Fine — a D-dimer is reasonable. But the clinical picture still strongly favours anxiety and I don't want to anchor this workup on PE.",
      },
      {
        agentId: "pe",
        content:
          "Anchoring on anxiety without excluding PE is exactly the error that leads to deaths in this demographic. Investigate first, anchor after.",
      },
    ],
    verdict: {
      recommendation: "Exclude PE before any discharge decision",
      confidence: "High",
      reasoning:
        "The PE Advocate correctly applied the structured diagnostic pathway. The Wells score, OCP risk factor, and demographic profile create a clinical obligation to exclude PE. The Anxiety Advocate's argument — while clinically plausible — cannot supersede a validated exclusion protocol. The anxiety framing may be correct, but it must be a diagnosis of exclusion, not an assumption. A D-dimer is low-cost, low-risk, and guideline-mandated in this scenario.",
      immediateAction:
        "Calculate Wells score, order D-dimer, hold all discharge decisions pending result",
    },
  },

  // ─── Aortic Dissection vs STEMI (turn ad-2, score 84) ──────────────────
  "ad-2": {
    agents: [
      {
        id: "stemi",
        name: "STEMI Advocate",
        diagnosis: "Inferior STEMI",
        color: "blue",
        icon: "🔵",
        side: "left",
      },
      {
        id: "dissection",
        name: "Dissection Advocate",
        diagnosis: "Type A Aortic Dissection",
        color: "rose",
        icon: "🔴",
        side: "right",
      },
      {
        id: "judge",
        name: "Judge",
        diagnosis: "Impartial Review",
        color: "teal",
        icon: "⚖️",
        side: "left",
      },
    ],
    messages: [
      {
        agentId: "stemi",
        content:
          "Inferior ST elevation in II, III, aVF. Hypertensive male in his 60s. High cardiovascular risk. This is the highest-probability STEMI presentation — door-to-balloon time is the metric that saves lives here.",
      },
      {
        agentId: "dissection",
        content:
          "The bilateral arm BP has not been measured. That was explicitly flagged as the critical next step. We have instantaneous maximal-onset pain, back radiation, and BP 178/104 on treatment. These are not incidental findings.",
      },
      {
        agentId: "stemi",
        content:
          "Dissection is rare. STEMI is common. Every minute of delay in a true STEMI increases mortality. We cannot hold the cath lab for a low-probability diagnosis.",
      },
      {
        agentId: "dissection",
        content:
          "The ADD-RS for this patient is at minimum 2 — high-risk pain descriptor plus high-risk aortic condition. At ADD-RS ≥1 with clinical suspicion, ESC guidelines mandate CT aortogram before STEMI activation. This is not a low-probability presentation.",
      },
      {
        agentId: "stemi",
        content:
          "ST elevation in inferior leads is objective ECG evidence. The dissection argument is circumstantial. We treat what the ECG shows.",
      },
      {
        agentId: "dissection",
        content:
          "Dissection extending into the right coronary ostium produces inferior ST elevation indistinguishable from primary STEMI. That mechanism is documented. The ECG cannot differentiate them. Anticoagulation in that context does not open a coronary — it haemorrhages the false lumen.",
      },
      {
        agentId: "stemi",
        content:
          "We would need CT, which takes time. If this is STEMI, that delay is harmful.",
      },
      {
        agentId: "dissection",
        content:
          "A bilateral arm BP takes 90 seconds. If the differential exceeds 20mmHg, you have your answer before CT. That measurement was requested in the first response and still hasn't been taken. Start there.",
      },
    ],
    verdict: {
      recommendation: "Measure bilateral arm BP before any intervention",
      confidence: "High",
      reasoning:
        "The Dissection Advocate identified the decisive procedural failure: the bilateral arm BP — flagged as critical in Turn 1 — was never measured before cath lab activation was considered. The STEMI Advocate's argument is clinically reasonable in isolation, but collapses once the mechanism of dissection-induced inferior ST elevation is acknowledged. The ECG cannot distinguish them. The ADD-RS of ≥2 meets the ESC threshold for CT aortogram before STEMI pathway activation. Anticoagulating an unexcluded Type A dissection risks catastrophic haemorrhage.",
      immediateAction:
        "Bilateral arm BP now. If differential >20mmHg or suspicion remains: CT aortogram before anticoagulation. Hold cath lab.",
    },
  },

  // ─── Meningitis vs Viral (turn mv-2, score 82) ─────────────────────────
  "mv-2": {
    agents: [
      {
        id: "bacterial",
        name: "Meningitis Advocate",
        diagnosis: "Bacterial Meningitis",
        color: "rose",
        icon: "🔴",
        side: "left",
      },
      {
        id: "viral",
        name: "Viral Advocate",
        diagnosis: "Viral URTI / Meningism",
        color: "blue",
        icon: "🔵",
        side: "right",
      },
      {
        id: "judge",
        name: "Judge",
        diagnosis: "Impartial Review",
        color: "teal",
        icon: "⚖️",
        side: "left",
      },
    ],
    messages: [
      {
        agentId: "bacterial",
        content:
          "Headache, fever, neck stiffness, photophobia. This is the complete meningitis tetrad in a 19-year-old in communal student housing. This is bacterial meningitis until LP proves otherwise.",
      },
      {
        agentId: "viral",
        content:
          "A heavy viral URTI season makes viral meningism statistically far more likely. The patient looks well — preserved GCS, no petechiae, no focal neurology.",
      },
      {
        agentId: "bacterial",
        content:
          "'Looks well' is not a validated negative predictor for bacterial meningitis. Patients can deteriorate from alert to obtunded within four hours of symptom onset. It has been documented repeatedly.",
      },
      {
        agentId: "viral",
        content:
          "Empirical antibiotics for every febrile student with a headache is inappropriate stewardship. Clinical judgement exists for a reason.",
      },
      {
        agentId: "bacterial",
        content:
          "We are not discussing every febrile student. We are discussing the complete tetrad. Untreated bacterial meningitis carries 50% mortality. The cost of treating a viral case is one course of ceftriaxone.",
      },
      {
        agentId: "viral",
        content:
          "The absence of petechial rash and the normal general appearance support a watchful waiting approach with a clear reassessment plan.",
      },
      {
        agentId: "bacterial",
        content:
          "Petechial rash is a late finding — present in 50-80% of meningococcal septicaemia but unreliable early. Waiting for rash means waiting for systemic sepsis. This is not a defensible safety net.",
      },
    ],
    verdict: {
      recommendation: "Treat as bacterial meningitis — empirical antibiotics now",
      confidence: "High",
      reasoning:
        "The Bacterial Meningitis Advocate's argument is decisive on every contested point. The complete tetrad is present. The communal living exposure risk is real. The time-critical nature of bacterial meningitis is not disputed. The Viral Advocate's arguments — viral season, normal appearance, absent rash — all fail under scrutiny: appearance is not a reliable early predictor, and rash is a late sign. The asymmetry of consequences is absolute: undertreating bacterial meningitis risks death; overtreating a viral illness costs a course of antibiotics.",
      immediateAction:
        "Blood cultures now, ceftriaxone 2g IV + dexamethasone immediately, arrange LP",
    },
  },
};

export function getDebate(turnId: string): AgentDebate | undefined {
  return debates[turnId];
}
