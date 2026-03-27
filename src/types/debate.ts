export interface DebateAgent {
  id: string;
  name: string;
  diagnosis: string;
  color: "blue" | "purple" | "teal" | "rose";
  icon: string;
  side: "left" | "right";
}

export interface DebateMessage {
  agentId: string;
  content: string;
}

export interface DebateVerdict {
  recommendation: string;
  reasoning: string;
  immediateAction: string;
  confidence: "High" | "Moderate";
}

export interface AgentDebate {
  agents: DebateAgent[];
  messages: DebateMessage[];
  verdict: DebateVerdict;
}
