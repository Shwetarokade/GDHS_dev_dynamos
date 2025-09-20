import type { SymptomAnalyzerInput, SymptomAnalyzerOutput } from "./types";

const ICD10_API_URL = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search";

function getApiKey() {
  return process.env.ICD10_API_KEY || "";
}

export async function analyzeSymptoms(input: SymptomAnalyzerInput): Promise<SymptomAnalyzerOutput> {
  const { symptoms, history } = input;
  const apiKey = getApiKey();
  const query = encodeURIComponent([...symptoms, history].join(" "));
  const url = `${ICD10_API_URL}?sf=code,name&terms=${query}`;

  const headers: Record<string, string> = {};
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("ICD-10 API error");
    const data = await response.json();
    // data[3] contains the results: [[code, name], ...]
    const icdCodes: string[] = (data[3] || []).map((row: any[]) => row[0]);
    const possibleDiagnoses: string[] = (data[3] || []).map((row: any[]) => row[1]);
    return { possibleDiagnoses, icdCodes };
  } catch (err) {
    console.error("ICD-10 API error", err);
    return { possibleDiagnoses: [], icdCodes: [] };
  }
}
