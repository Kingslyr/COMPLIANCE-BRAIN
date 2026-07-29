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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const industry = formData.get("industry") as string;
    const country = formData.get("country") as string;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    let pdfText = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text.slice(0, 3000);
    } catch {
      pdfText = `Document: ${file.name}`;
    }

    // Get regulations from DB
    const { data: regulations } = await supabaseAdmin
      .from("regulations")
      .select("title, section, page_number, content, penalty")
      .eq("industry", industry)
      .eq("country", country)
      .limit(5);

    const regContext = (regulations || [])
      .map((r: any) => `- ${r.title} (${r.section}, p.${r.page_number})`)
      .join("\n");

    const prompt = `You are a compliance expert. Analyze this document for ${industry} industry compliance in ${country}.

DOCUMENT CONTENT:
${pdfText}

APPLICABLE REGULATIONS:
${regContext || `General ${industry} regulations in ${country}`}

Return ONLY valid JSON:
{
  "overall_score": 75,
  "risk_level": "medium",
  "summary": "2-3 sentence executive summary of compliance status",
  "compliant_areas": ["Area 1 that is compliant", "Area 2"],
  "gaps": [
    {
      "issue": "Specific compliance gap",
      "regulation": "Relevant regulation reference",
      "severity": "high",
      "action": "What needs to be done"
    }
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "priority": "high"
    }
  ]
}`;

    const text = await callGroq(prompt);
    const clean = text.replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      result = {
        overall_score: 70,
        risk_level: "medium",
        summary: `Document analyzed for ${industry} compliance in ${country}. Manual review recommended.`,
        compliant_areas: ["Document submitted for review"],
        gaps: [{ issue: "Full analysis required", regulation: "General compliance", severity: "medium", action: "Schedule compliance audit" }],
        recommendations: [{ title: "Compliance Review", description: "Conduct detailed compliance review with qualified expert", priority: "high" }]
      };
    }

    // Save to DB
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    await supabaseAdmin.storage.from("documents").upload(filePath, buffer, {
      contentType: file.type || "application/pdf"
    });

    const { data: doc } = await supabaseAdmin
      .from("uploaded_documents")
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        industry,
        country,
        analysis_status: "done",
        analysis_result: result,
      })
      .select()
      .single();

    return NextResponse.json({ success: true, result, doc });
  } catch (error: any) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}