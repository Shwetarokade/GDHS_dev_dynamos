export interface ChatOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  text: string;
  raw?: any;
}

function getEnv(name: string, fallback?: string) {
  const value = (import.meta as any).env?.[name];
  return value ?? fallback;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export async function chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
  const apiKey = getEnv("VITE_OPENAI_API_KEY");
  const baseUrl = getEnv("VITE_OPENAI_BASE_URL", DEFAULT_BASE_URL);
  const model = getEnv("VITE_OPENAI_MODEL", DEFAULT_MODEL);

  // Safe mock fallback when no API key is provided
  if (!apiKey) {
    const lastUser = messages.filter(m => m.role === "user").map(m => m.content).pop() || "";
    return {
      text: `MOCK_RESPONSE: Based on the input, likely conditions include Example Condition. Evidence: ${lastUser.slice(0, 140)}... Recommendations: follow-up labs, lifestyle changes.`,
    };
  }

  const body = {
    model,
    messages: [
      ...(options.system ? [{ role: "system", content: options.system } as ChatMessage] : []),
      ...messages,
    ],
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 600,
  } as any;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Chat API error: ${res.status} ${res.statusText} ${errText}`);
  }
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content ?? "";
  return { text, raw: json };
}


