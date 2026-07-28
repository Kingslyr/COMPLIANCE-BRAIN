// 🔧 TEMPORARY DEBUG ROUTE — DELETE AFTER FIXING
// Place at: /app/api/debug/route.ts
// Visit: https://compliance-brain.vercel.app/api/debug
// DELETE THIS FILE after confirming everything works!

import { NextResponse } from "next/server";

export async function GET() {
    const checks: any = {};

    // 1. Check environment variables
    checks.env = {
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
            ? `✅ Set (starts with: ${process.env.OPENROUTER_API_KEY.substring(0, 15)}...)`
            : "❌ NOT SET",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? `✅ Set`
            : "❌ NOT SET",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
            ? `✅ Set`
            : "❌ NOT SET",
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "❌ NOT SET",
    };

    // 2. Test OpenRouter API call
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://compliance-brain.vercel.app",
                "X-Title": "Compliance Brain Debug",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct:free",
                messages: [{ role: "user", content: "Say only: WORKING" }],
                max_tokens: 10,
            }),
        });

        const data = await response.json();

        checks.openrouter = {
            status: response.status,
            ok: response.ok,
            model_response: data.choices?.[0]?.message?.content || null,
            error: data.error || null,
            raw: response.ok ? "See model_response" : JSON.stringify(data),
        };
    } catch (err: any) {
        checks.openrouter = {
            status: "FETCH_ERROR",
            error: err.message,
        };
    }

    // 3. Test fallback model
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://compliance-brain.vercel.app",
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct:free",
                messages: [{ role: "user", content: "Say only: FALLBACK_WORKING" }],
                max_tokens: 10,
            }),
        });

        const data = await response.json();
        checks.openrouter_fallback = {
            status: response.status,
            model_response: data.choices?.[0]?.message?.content || null,
            error: data.error || null,
        };
    } catch (err: any) {
        checks.openrouter_fallback = { error: err.message };
    }

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        checks,
        instructions: "If OPENROUTER_API_KEY shows NOT SET — go to Vercel Dashboard > Settings > Environment Variables and add it, then redeploy.",
    }, { status: 200 });
}