const API_BASE = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`
  : "http://localhost:8080/api";

export interface TafseerResult {
  tafseer: string;
  surahId: number;
  ayahNumber: number;
}

export async function fetchTafseer(
  surahId: number,
  surahName: string,
  ayahNumber: number,
  arabicText: string,
  translation: string,
  language: string = "English"
): Promise<TafseerResult> {
  const res = await fetch(`${API_BASE}/ai/tafseer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surahId, surahName, ayahNumber, arabicText, translation, language }),
  });
  if (!res.ok) throw new Error(`AI API error: ${res.status}`);
  return res.json() as Promise<TafseerResult>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      onError(`HTTP error: ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) onChunk(data.content);
            if (data.done) onDone();
            if (data.error) onError(data.error);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err) {
    onError(String(err));
  }
}

export async function fetchInsight(
  arabic: string,
  translation: string,
  reference: string
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/ai/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arabic, translation, reference }),
    });
    if (!res.ok) return "";
    const data = await res.json() as { insight: string };
    return data.insight ?? "";
  } catch {
    return "";
  }
}
