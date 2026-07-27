import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { docId, industry, country, fileName } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `A company in the ${industry} industry in ${country} has uploaded a document named "${fileName}" for compliance review.

Based on typical ${industry} regulations in ${country}, provide a compliance analysis summary. Return ONLY valid JSON:
{
  "summary": "Brief analysis of what compliance areas this document likely covers",
  "gaps": ["Potential gap 1", "Potential gap 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "risk_level": "low|medium|high"
}`,
      }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
