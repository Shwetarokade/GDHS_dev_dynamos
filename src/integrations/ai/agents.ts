import { chat } from "./provider";
import type { PatientData } from "@/components/PatientForm";

export interface AgentOutput {
  agentId: string;
  findings: string[];
  summary: string;
}

const SYSTEM_BASE = `You are a medical assistant collaborating in a multi-agent diagnostic workflow. 
Strictly output concise bullet findings and a one-line summary. Do not include PHI beyond what is provided.`;

export async function runLiteratureAgent(patient: PatientData): Promise<AgentOutput> {
  const prompt = `Patient overview: ${JSON.stringify(patient)}\nTask: Search your internal knowledge for medical literature insights relevant to the symptoms and complaint. Provide 3-5 bullet findings and a brief summary.`;
  const res = await chat([{ role: "user", content: prompt }], { system: SYSTEM_BASE, maxTokens: 500 });
  return parseAgent("literature", res.text);
}

export async function runDatabaseAgent(patient: PatientData): Promise<AgentOutput> {
  const prompt = `Patient overview: ${JSON.stringify(patient)}\nTask: Provide guideline-based criteria and checks from clinical databases relevant to the case. Provide 3-5 bullet findings and a brief summary.`;
  const res = await chat([{ role: "user", content: prompt }], { system: SYSTEM_BASE, maxTokens: 500 });
  return parseAgent("database", res.text);
}

export async function runCaseHistoryAgent(patient: PatientData): Promise<AgentOutput> {
  const prompt = `Patient overview: ${JSON.stringify(patient)}\nTask: Infer patterns from similar historical cases. Provide 3-5 bullet findings and a brief summary.`;
  const res = await chat([{ role: "user", content: prompt }], { system: SYSTEM_BASE, maxTokens: 500 });
  return parseAgent("cases", res.text);
}

export async function runSymptomAnalyzer(patient: PatientData): Promise<AgentOutput> {
  const prompt = `Symptoms: ${patient.symptoms.join(", ")}\nPrimary complaint: ${patient.primaryComplaint}\nTask: Analyze symptom clusters and likely differentials with confidence hints. Provide 3-5 bullet findings and a brief summary.`;
  const res = await chat([{ role: "user", content: prompt }], { system: SYSTEM_BASE, maxTokens: 500 });
  return parseAgent("symptoms", res.text);
}

export async function runPatternRecognition(patient: PatientData): Promise<AgentOutput> {
  const prompt = `Patient data: ${JSON.stringify(patient)}\nTask: Synthesize a pattern-based confidence estimate for the most likely diagnoses. Provide 3-5 bullet findings and a brief summary.`;
  const res = await chat([{ role: "user", content: prompt }], { system: SYSTEM_BASE, maxTokens: 500 });
  return parseAgent("patterns", res.text);
}

function parseAgent(agentId: string, text: string): AgentOutput {
  const lines = text.split(/\r?\n/).map(l => l.replace(/^[-•\*]\s?/, "").trim()).filter(Boolean);
  const summary = lines.pop() || text.trim();
  const findings = lines.slice(0, 6);
  return { agentId, findings, summary };
}

export async function runAllAgents(patient: PatientData) {
  const [literature, database, cases, symptoms, patterns] = await Promise.all([
    runLiteratureAgent(patient),
    runDatabaseAgent(patient),
    runCaseHistoryAgent(patient),
    runSymptomAnalyzer(patient),
    runPatternRecognition(patient),
  ]);
  return { literature, database, cases, symptoms, patterns };
}


