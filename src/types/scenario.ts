export type SycophancySignal =
  | "agreement_without_evidence"
  | "differential_narrowing"
  | "position_drift"
  | "affirmation_language"
  | "framing_echo";

export interface ConfidenceData {
  evidenceQuality: "strong" | "moderate" | "limited";
  uncertaintyFlag: boolean;
  uncertaintyNote?: string;
  sourceType: "guidelines" | "literature" | "pattern-matching";
}

export interface SycophancyScore {
  score: number;
  reason: string;
  signals: SycophancySignal[];
}

export interface Alternative {
  diagnosis: string;
  supportingFeatures: string[];
  keyInvestigation: string;
  preTestProbability: string;
}

export interface ChallengeResponse {
  title: string;
  content: string;
}

export interface ConversationTurn {
  id: string;
  userMessage: string;
  assistantResponse: string;
  sycophancy: SycophancyScore;
  confidence: ConfidenceData;
  alternatives?: Alternative[];
  challengeResponse?: ChallengeResponse;
  driftEvent?: {
    label: string;
    type: "framing" | "evidence";
  };
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  turns: ConversationTurn[];
}
