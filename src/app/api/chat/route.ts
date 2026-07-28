import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, industry, country } = await req.json();

    const { data: regulations } = await supabaseAdmin
      .from("regulations")
      .select("*")
      .or(`industry.eq.${industry},industry.eq.All`)
      .or(`country.eq.${country},country.eq.All`)
      .limit(8);

    const regContext = regulations && regulations.length > 0
      ? regulations.map((r: any) =>
        `[${r.document_name} | ${r.country} | ${r.industry} | Section ${r.section_number || "N/A"} | Page ${r.page_number || "N/A"}]\n${r.content}`
      ).join("\n\n---\n\n")
      : "No specific regulations found. Provide general guidance based on your knowledge.";

    const prompt = `You are Compliance Brain, an expert AI compliance assistant for ${industry} industry in ${country} and MENA region.

Answer compliance questions with EXACT references to regulations.

REGULATIONS:
${regContext}

RULES:
- Cite exact document name, section, page when available
- Format: [Document Name, Section X, Page Y]
- Be concise and clear
- Use bullet points for multiple requirements

USER QUESTION: ${message}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.3 },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const assistantMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not process your request.";

    const refs = (regulations || [])
      .filter((r: any) => assistantMessage.includes(r.document_name))
      .map((r: any) => ({
        doc_name: r.document_name,
        section: r.section_number,
        page: r.page_number,
        line: r.line_number,
        country: r.country,
        industry: r.industry,
      }));

    await supabaseAdmin.from("chat_messages").insert([
      { session_id: sessionId, user_id: userId, role: "user", content: message },
      { session_id: sessionId, user_id: userId, role: "assistant", content: assistantMessage, reg_references: refs },
    ]);

    return NextResponse.json({ message: assistantMessage, references: refs });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}