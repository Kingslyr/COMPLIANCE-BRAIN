import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ PRIMARY: OpenRouter with reliable free model
// ✅ FALLBACK: Second free model if first fails
const MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free",
];

async function callOpenRouter(messages: any[], modelIndex = 0): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const model = MODELS[modelIndex];
  console.log(`[Chat API] Trying model: ${model}`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://compliance-brain.vercel.app",
      "X-Title": "Compliance Brain",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Chat API] Model ${model} failed: ${response.status} — ${errorText}`);

    // Try next model if available
    if (modelIndex + 1 < MODELS.length) {
      console.log(`[Chat API] Falling back to next model...`);
      return callOpenRouter(messages, modelIndex + 1);
    }

    throw new Error(`All models failed. Last error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    console.error("[Chat API] Empty response from OpenRouter:", JSON.stringify(data));

    // Try next model if empty response
    if (modelIndex + 1 < MODELS.length) {
      return callOpenRouter(messages, modelIndex + 1);
    }

    throw new Error("No content in response from any model");
  }

  console.log(`[Chat API] Success with model: ${model}`);
  return content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, sessionId, industry, country } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Fetch relevant regulations from Supabase
    let regulationContext = "";
    try {
      const { data: regulations } = await supabase
        .from("regulations")
        .select("title, content, section, page_number, industry, country")
        .eq("country", country || "Pakistan")
        .eq("industry", industry || "General")
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

    const systemPrompt = `You are Compliance Brain, an expert AI compliance assistant specializing in regulatory requirements for businesses in Pakistan, UAE, Saudi Arabia, and Egypt.

Your expertise covers:
- Environmental regulations
- Health & Safety (OSHA, IOSH standards)
- Industry-specific compliance (Textile, Construction, Pharmaceutical)
- Labor laws and workplace standards

When answering:
1. Always cite specific regulations with section numbers and page references when available
2. Be precise and actionable
3. Highlight critical compliance deadlines or penalties
4. Format responses clearly with bullet points for requirements
5. If regulations data is available, reference it directly${regulationContext}

Current context: Industry: ${industry || "General"}, Country: ${country || "Pakistan"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const aiResponse = await callOpenRouter(messages);

    // Save to chat history if userId provided
    if (userId && sessionId) {
      try {
        await supabase.from("chat_messages").insert([
          {
            user_id: userId,
            session_id: sessionId,
            role: "user",
            content: message,
            created_at: new Date().toISOString(),
          },
          {
            user_id: userId,
            session_id: sessionId,
            role: "assistant",
            content: aiResponse,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (dbError) {
        console.warn("[Chat API] Could not save chat history:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
      model: MODELS[0],
    });

  } catch (error: any) {
    console.error("[Chat API] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your request",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}