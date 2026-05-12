
function getApiBase(): string {
  const explicit = process.env["EXPO_PUBLIC_API_BASE_URL"]?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  
  // Default fallback for development
  return "https://quran-be-one.vercel.app/api";
}


const API_BASE = getApiBase();
console.log("[aiService] Using API_BASE:", API_BASE);

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
  language: string = "English",
  scholar?: string
): Promise<TafseerResult> {
  const res = await fetch(`${API_BASE}/ai/tafseer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surahId, surahName, ayahNumber, arabicText, translation, language, scholar }),
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
      throw new Error(`HTTP error: ${res.status}`);
    }

    if (typeof res.body?.getReader !== "function") {
      throw new Error("Streaming is not supported on this device/environment");
    }

    const reader = res.body.getReader();
    const Decoder = global.TextDecoder || (window as any).TextDecoder;

    if (!Decoder) {
      throw new Error("TextDecoder is missing. Please check your environment polyfills.");
    }

    const decoder = new Decoder("utf-8");
    let buffer = "";

    console.log("[aiService] Starting to read stream...");

    while (true) {
      // Add a 2-second timeout to the read operation (faster fallback)
      const readPromise = reader.read();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Stream read timeout")), 2000)
      );

      const { done, value } = await Promise.race([readPromise, timeoutPromise]);
      
      if (done) {
        console.log("[aiService] Stream reader done");
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        try {
          const rawData = trimmed.slice(6);
          const data = JSON.parse(rawData);

          if (data.content) {
            console.log(`[aiService] Received chunk: "${data.content}"`);
            onChunk(data.content);
          }
          if (data.done) {
            console.log("[aiService] Backend signaled done");
            onDone();
          }
          if (data.error) {
            console.error("[aiService] Backend error in stream:", data.error);
            onError(data.error);
          }
        } catch (e) {
          console.warn("[aiService] Error parsing SSE line:", line, e);
        }
      }
    }
    onDone();
  } catch (err) {
    console.warn("[aiService] Streaming failed, falling back to sync mode...", err);
    
    // Fallback: try non-streaming endpoint
    try {
      const syncRes = await fetch(`${API_BASE}/ai/chat-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      
      if (!syncRes.ok) throw new Error(`Sync fallback failed: ${syncRes.status}`);
      
      const data = await syncRes.json();
      if (data.content) {
        onChunk(data.content);
        onDone();
      } else {
        throw new Error("No content in sync response");
      }
    } catch (syncErr) {
      console.error("[aiService] Both streaming and sync failed:", syncErr);
      onError(String(syncErr));
    }
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

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/ai/test`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    console.error("[aiService] Connection test failed:", err);
    return { success: false, message: String(err) };
  }
}
