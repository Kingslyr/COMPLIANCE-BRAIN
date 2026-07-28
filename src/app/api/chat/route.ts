import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, industry, country } = await req.json();

    // 1. Search regulations from DB
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
      : "No specific regulations found in database. Provide general guidance based on your knowledge.";

    // 2. Build prompt for Gemini
    const prompt = `You are Compliance Brain, an expert AI compliance assistant specializing in ${industry} industry regulations for ${country} and MENA region.

Your job is to answer compliance questions with EXACT references to regulations.

REGULATIONS DATABASE:
${regContext}

RULES:
- Always cite the exact document name, section number, page number when available
- Format references as: [Document Name, Section X, Page Y]
- Be concise and clear
- Structure: direct answer → cite regulation → what action is needed
- Use bullet points for multiple requirements
- End with: "Reference: [Document, Section, Page]" for each cited regulation

USER QUESTION: ${message}`;

    // 3. Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    // 4. Extract references
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

    // 5. Save messages to DB
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