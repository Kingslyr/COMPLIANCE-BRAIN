import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
      .textSearch("content", message.split(" ").slice(0, 5).join(" | "), {
        type: "websearch",
        config: "english",
      })
      .limit(8);

    const regContext = regulations && regulations.length > 0
      ? regulations.map((r: any) =>
          `[${r.document_name} | ${r.country} | ${r.industry} | Section ${r.section_number || "N/A"} | Page ${r.page_number || "N/A"}]\n${r.content}`
        ).join("\n\n---\n\n")
      : "No specific regulations found in database. Provide general guidance.";

    // 2. Build system prompt
    const systemPrompt = `You are Compliance Brain, an expert AI compliance assistant specializing in ${industry} industry regulations for ${country} and MENA region.

Your job is to answer compliance questions with EXACT references to regulations.

REGULATIONS DATABASE:
${regContext}

RULES:
- Always cite the exact document name, section number, page number, and line number when available
- Format references as: [Document Name, Section X, Page Y, Line Z]
- If a regulation is in the database, use it. If not, give general guidance and say the regulation may need verification
- Be concise and clear — the user may not be a legal expert
- Structure your answer: first give a direct answer, then cite the regulation, then explain what action is needed
- Use bullet points for multiple requirements
- End with: "Reference: [Document, Section, Page, Line]" for each cited regulation`;

    // 3. Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const assistantMessage = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // 4. Extract references from response
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
      { session_id: sessionId, user_id: userId, role: "assistant", content: assistantMessage, references: refs },
    ]);

    return NextResponse.json({ message: assistantMessage, references: refs });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
