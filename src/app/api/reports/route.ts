import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, industry, country, companyName } = await req.json();

    const { data: regulations } = await supabaseAdmin
      .from("regulations")
      .select("*")
      .or(`industry.eq.${industry},industry.eq.All`)
      .or(`country.eq.${country},country.eq.All`)
      .eq("is_active", true)
      .limit(50);

    const regText = (regulations || [])
      .map((r: any) => `[${r.category}] ${r.title} (${r.document_name}, Sec ${r.section_number}, Pg ${r.page_number}): ${r.content}`)
      .join("\n\n");

    const prompt = `Generate a comprehensive compliance report for:
Company: ${companyName || "The Company"}
Industry: ${industry}
Country: ${country}

Available regulations:
${regText || "Use general knowledge for " + industry + " regulations in " + country}

Return ONLY valid JSON in this exact format:
{
  "summary": "Executive summary of compliance requirements (2-3 sentences)",
  "industry": "${industry}",
  "country": "${country}",
  "company_name": "${companyName || "The Company"}",
  "sections": [
    {
      "category": "Category name (e.g. Environmental, Safety, Labor)",
      "regulations": [
        {
          "title": "Regulation title",
          "reference": "Document name, Section X, Page Y",
          "requirement": "What the company must do",
          "status": "review-needed"
        }
      ]
    }
  ],
  "generated_at": "${new Date().toISOString()}"
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://compliance-brain.vercel.app",
        "X-Title": "Compliance Brain",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const reportData = JSON.parse(clean);

    const { data: report } = await supabaseAdmin
      .from("compliance_reports")
      .insert({
        user_id: userId,
        title: `${industry} Compliance Report — ${country}`,
        industry,
        country,
        company_name: companyName,
        report_data: reportData,
        status: "generated",
      })
      .select()
      .single();

    return NextResponse.json({ report, reportData });
  } catch (error: any) {
    console.error("Report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}