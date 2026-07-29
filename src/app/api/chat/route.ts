import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Chat API] Groq error: ${response.status} — ${errorText}`);
    throw new Error(`Groq API failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content in Groq response");
  return content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, sessionId, industry, country } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let regulationContext = "";
    try {
      const { data: regulations } = await supabase
        .from("regulations")
        .select("title, content, section, page_number, industry, country")
        .eq("country", country || "Pakistan")
        .eq("industry", industry || "Textile")
        .limit(5);

      if (regulations && regulations.length > 0) {
        regulationContext = "\n\nRelevant Regulations:\n" +
          regulations.map(r =>
            `[${r.country} - ${r.industry}] ${r.title} (Section ${r.section}, Page ${r.page_number}):\n${r.content}`
          ).join("\n\n");
      }
    } catch (dbError) {
      console.warn("[Chat API] Could not fetch regulations:", dbError);
    }

    const fullPrompt = `You are Compliance Brain, an expert AI compliance assistant for Pakistan, UAE, Saudi Arabia, and Egypt.

Your expertise: Environmental regulations, Health & Safety (OSHA, IOSH), Textile/Construction/Pharmaceutical compliance, Labor laws.

Rules:
1. Cite specific regulations with section numbers and page references
2. Be precise and actionable
3. Highlight penalties and deadlines
4. Use bullet points for clarity

Context: Industry: ${industry || "Textile"}, Country: ${country || "Pakistan"}
${regulationContext}

User question: ${message}`;

    const aiResponse = await callGroq(fullPrompt);

    if (userId && sessionId) {
      try {
        await supabase.from("chat_messages").insert([
          { user_id: userId, session_id: sessionId, role: "user", content: message, created_at: new Date().toISOString() },
          { user_id: userId, session_id: sessionId, role: "assistant", content: aiResponse, created_at: new Date().toISOString() },
        ]);
      } catch (dbError) {
        console.warn("[Chat API] Could not save chat history:", dbError);
      }
    }

    return NextResponse.json({ success: true, message: aiResponse, model: "groq-llama-3.1" });

  } catch (error: any) {
    console.error("[Chat API] Fatal error:", error);
    return NextResponse.json({ success: false, error: "Failed to process your request" }, { status: 500 });
  }
}