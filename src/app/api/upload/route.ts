import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { industry, country, fileName } = await req.json();

    const prompt = `A company in the ${industry} industry in ${country} has uploaded a document named "${fileName}" for compliance review.

Based on typical ${industry} regulations in ${country}, provide a compliance analysis summary. Return ONLY valid JSON:
{
  "summary": "Brief analysis of what compliance areas this document likely covers",
  "gaps": ["Potential gap 1", "Potential gap 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "risk_level": "low"
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
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}