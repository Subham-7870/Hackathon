// Groq AI Service — Direct API integration for SthitiShodhana AI Co-Pilot
// Model: llama-3.3-70b-versatile (fastest open-source LLM on Groq infra)

const GROQ_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY) || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export const RAILWAY_SYSTEM_PROMPT = `You are SthitiShodhana AI Co-Pilot (स्थितिशोधन), an expert autonomous train dispatching assistant for Indian Railways — specifically for the North Central Railway (NCR) Prayagraj Division on the Ghaziabad–Aligarh triple-line section (106.1 RKM).

You have deep expertise in:
- Indian Railways operating rules (GR&SR, IRPWM, IRTMM, Block Working Rules)
- CRIS systems: RTIS, FOIS, ICMS, NTES, TMS
- OHE/TRD 25kV maintenance blocks (Form T/172)
- P-Way mega-blocks (Form T/351, USFD testing, tamping machines)
- S&T signal point interlocking (Form T/351 disconnection)
- KAVACH 4.0 ATP system (SIL-4), NavIC/GAGAN RTIS telemetry
- Maintenance windows: Block periods, TSR caution orders (T/409)
- Train diversion via crossover points (#12A, #14B, #6A, #4B)
- Freight corridor: EDFC (Eastern DFC, 25T axle load)
- Real-time conflict detection, meet/pass optimization, fleeting

Current active scenario:
- Block 1 (DOWN MAIN): Form T/351 P-Way mega-block, Somna KM 105–126, 09-3X Tamping Express operating
- Block 2 (UP MAIN): Form T/172 TRD OHE block, Dadri KM 37 – Dankaur KM 54
- Block 3 (EDFC): USFD Rail Grinding block, Khurja KM 83
- 10 trains active; diversion route via Point #12A → 3rd Line → Point #14B

Respond concisely, use railway terminology, and provide actionable dispatch recommendations. Format key data as structured lists when helpful.`;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export async function chatWithGroq(
  messages: ChatMessage[],
  onChunk?: (delta: string) => void
): Promise<string> {
  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: RAILWAY_SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.4,
    max_tokens: 1024,
    stream: !!onChunk,
  };

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(`Groq API error: ${err?.error?.message || res.statusText}`);
  }

  // Streaming mode
  if (onChunk && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.replace('data: ', '').trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {
          // skip parse errors on partial chunks
        }
      }
    }
    return fullText;
  }

  // Non-streaming mode
  const data: GroqResponse = await res.json();
  return data.choices[0]?.message?.content || '';
}

// Structured memo parsing via Groq (replaces backend parseMemo fallback)
export async function parseMemoWithGroq(memoText: string): Promise<{
  department: string;
  location_sector: string;
  duration_minutes: number;
  priority: string;
  machine_allocated: string;
  km_range: string;
  nature_of_work: string;
  preferred_window: string;
}> {
  const prompt = `Parse this Indian Railways maintenance memo and extract entities as JSON only (no markdown, no explanation):

Memo: "${memoText}"

Return exactly this JSON structure:
{
  "department": "P-Way|OHE/TRD|S&T|Signalling",
  "location_sector": "e.g. SEC-NDLS-CNB-01",
  "duration_minutes": <number>,
  "priority": "CRITICAL|HIGH|NORMAL|LOW",
  "machine_allocated": "e.g. 09-3X Tamping Express|Tower Wagon|SPENO RG-48",
  "km_range": "e.g. KM 1014.0–1015.2",
  "nature_of_work": "brief description",
  "preferred_window": "e.g. 02:00–04:00 IST"
}`;

  const result = await chatWithGroq([{ role: 'user', content: prompt }]);
  try {
    // Extract JSON from response (in case model adds text)
    const match = result.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(result);
  } catch {
    throw new Error('Failed to parse Groq memo response as JSON');
  }
}
