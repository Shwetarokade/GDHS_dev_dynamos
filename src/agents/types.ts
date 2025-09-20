// Shared agent types

export interface SymptomAnalyzerInput {
  symptoms: string[];
  history: string;
}
export interface SymptomAnalyzerOutput {
  possibleDiagnoses: string[];
  icdCodes: string[];
}

export interface LiteratureRetrieverInput {
  query: string;
}
export interface LiteratureRetrieverOutput {
  articles: Array<{
    title: string;
    abstract: string;
    url?: string;
    source: string;
  }>;
}

export interface CaseMatcherInput {
  newCase: any;
}
export interface CaseMatcherOutput {
  matchedCases: Array<any>;
}

export interface TreatmentRecommenderInput {
  condition: string;
}
export interface TreatmentRecommenderOutput {
  recommendations: Array<string|{name:string;type?:string;urgency?:string;}>;
}

export interface SummarizerAgentInput {
  data: any;
}
export interface SummarizerAgentOutput {
  summary: string;
}
