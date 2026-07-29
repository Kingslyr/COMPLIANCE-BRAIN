import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
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
      max_tokens: 1000,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq failed: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No content from Groq");
  return content;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, industry, country, companyName } = await req.json();

    const { data: regulations } = await supabaseAdmin
      .from("regulations")
      .select("title, section, page_number, content, penalty, regulation_code")
      .eq("industry", industry)
      .eq("country", country)
      .limit(6);

    const regText = (regulations || [])
      .map((r: any) => `- ${r.title} (${r.section}, p.${r.page_number}): ${r.content.slice(0, 80)}`)
      .join("\n");

    const prompt = `Generate compliance report for ${companyName || "Company"}, ${industry} industry, ${country}.

Regulations:
${regText || `General ${industry} regulations in ${country}`}

Return ONLY valid JSON:
{"summary":"2 sentence summary","industry":"${industry}","country":"${country}","company_name":"${companyName || "The Company"}","overall_score":75,"sections":[{"category":"Safety","regulations":[{"title":"Regulation title","reference":"Section X, Page Y","requirement":"What must be done","status":"review-needed","penalty":"Fine amount if available"}]}],"generated_at":"${new Date().toISOString()}"}`;

    const text = await callGroq(prompt);
    const clean = text.replace(/```json|```/g, "").trim();

    let reportData;
    try {
      reportData = JSON.parse(clean);
    } catch {
      reportData = {
        summary: `Compliance report for ${industry} industry in ${country}.`,
        industry, country,
        company_name: companyName || "The Company",
        overall_score: 70,
        sections: [{
          category: "General Compliance",
          regulations: [{
            title: "Compliance Review Required",
            reference: "General",
            requirement: "Review all applicable regulations with qualified expert",
            status: "review-needed",
            penalty: "Varies"
          }]
        }],
        generated_at: new Date().toISOString()
      };
    }

    const { data: report, error } = await supabaseAdmin
      .from("compliance_reports")
      .insert({
        user_id: userId,
        title: `${industry} Compliance Report — ${country}`,
        industry, country,
        company_name: companyName,
        report_data: reportData,
        status: "generated",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, report, reportData });
  } catch (error: any) {
    console.error("[Reports API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}