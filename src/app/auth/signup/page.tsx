"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const INDUSTRIES = ["Textile", "Construction", "Pharmaceutical"];
const COUNTRIES = ["Pakistan", "UAE", "Saudi Arabia", "Egypt"];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", company_name: "", account_type: "individual" as "individual" | "company", industry: "", country: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name, company_name: form.company_name, account_type: form.account_type, industry: form.industry, country: form.country } },
    });
    if (error) { setError(error.message); setLoading(false); }
    else router.push("/dashboard");
  };

  const inp: React.CSSProperties = { width: "100%", padding: "8px 12px", fontSize: 12, border: "1px solid #222", borderRadius: 10, outline: "none", fontFamily: "Inter, sans-serif", color: "#fff", background: "#111", transition: "border-color 0.15s" };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        input::placeholder, select option { color: #333; background: #111; }
        input:focus, select:focus { border-color: #00FF88 !important; box-shadow: 0 0 0 3px #00FF8812 !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 28 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #003300, #00CC44, #00FF88)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={14} color="#0A0A0A" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Compliance Brain</span>
        </Link>

        <div style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", borderRadius: 16, padding: "28px 24px", boxShadow: "0 0 40px rgba(0,255,136,0.04)" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "200% auto", letterSpacing: "-0.02em", marginBottom: 4 }}>Create account</h1>
          <p style={{ fontSize: 12, color: "#444", marginBottom: 22 }}>Start your compliance journey</p>

          {error && <div style={{ background: "#1A0000", border: "1px solid #FF444430", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#FF6666", marginBottom: 14 }}>{error}</div>}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>Full name</label>
              <input style={inp} placeholder="Your name" value={form.full_name} onChange={e => set("full_name", e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>Email</label>
              <input type="email" style={inp} placeholder="you@company.com" value={form.email} onChange={e => set("email", e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>Password</label>
              <input type="password" style={inp} placeholder="Min 8 characters" value={form.password} onChange={e => set("password", e.target.value)} minLength={8} required />
            </div>

            {/* Account type */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>Account type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {(["individual", "company"] as const).map(t => (
                  <button key={t} type="button" onClick={() => set("account_type", t)}
                    style={{ padding: "8px", fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", border: form.account_type === t ? "1px solid #00FF8840" : "1px solid #1E1E1E", background: form.account_type === t ? "#00FF8810" : "#111", color: form.account_type === t ? "#00FF88" : "#444" }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {form.account_type === "company" && (
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>Company name</label>
                <input style={inp} placeholder="Your company" value={form.company_name} onChange={e => set("company_name", e.target.value)} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>Industry</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.industry} onChange={e => set("industry", e.target.value)} required>
                  <option value="">Select</option>
                  {INDUSTRIES.map(i => <option key={i} style={{ background: "#111" }}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>Country</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.country} onChange={e => set("country", e.target.value)} required>
                  <option value="">Select</option>
                  {COUNTRIES.map(c => <option key={c} style={{ background: "#111" }}>{c}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "11px", fontSize: 13, fontWeight: 700, background: loading ? "#111" : "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)", backgroundSize: "200% auto", color: loading ? "#444" : "#0A0A0A", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit", boxShadow: loading ? "none" : "0 0 24px #00FF8825", marginTop: 4 }}>
              {loading ? "Creating..." : <><span>Create account</span><ArrowRight size={13} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "#333", marginTop: 18 }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#00FF88", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}