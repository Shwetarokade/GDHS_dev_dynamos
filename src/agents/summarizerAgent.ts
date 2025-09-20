import type { SummarizerAgentInput, SummarizerAgentOutput } from "./types";

const HF_API_URL = "https://api-inference.huggingface.co/models/";
const HF_MODEL = "facebook/bart-large-cnn"; // Example: replace with biomedical model if needed

function getHuggingFaceApiKey() {
  return process.env.HUGGINGFACE_API_KEY || "";
}

// Summarizer Agent: HuggingFace Transformers integration
export async function summarizeReport(input: SummarizerAgentInput): Promise<SummarizerAgentOutput> {
  const apiKey = getHuggingFaceApiKey();
  const url = `${HF_API_URL}${HF_MODEL}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: input.data })
    });
    if (!response.ok) throw new Error("HuggingFace API error");
    const data = await response.json();
    // HuggingFace returns [{summary_text: ...}]
    const summary = Array.isArray(data) && data[0]?.summary_text ? data[0].summary_text : "";
    return { summary };
  } catch (err) {
    console.error("HuggingFace API error", err);
    return { summary: "" };
  }
}
