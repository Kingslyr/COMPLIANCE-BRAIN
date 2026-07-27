"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push("/dashboard");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 13,
    border: "1px solid #222", borderRadius: 10, outline: "none",
    fontFamily: "Inter, sans-serif", color: "#fff",
    background: "#111", transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        input::placeholder { color: #333; }
        input:focus { border-color: #00FF88 !important; box-shadow: 0 0 0 3px #00FF8815 !important; }
        @media (max-width: 768px) { .left-panel { display: none !important; } }
      `}</style>

      {/* Left metallic panel */}
      <div className="left-panel" style={{
        width: 420, flexShrink: 0, position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #0A1A0A 0%, #0D2B0D 30%, #0A1A0A 60%, #061006 100%)",
        borderRight: "1px solid #1A2A1A",
        display: "flex", flexDirection: "column", padding: "40px"
      }}>
        {/* Metallic green glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, background: "radial-gradient(circle, #00FF8815 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-20%", width: 200, height: 200, background: "radial-gradient(circle, #00CC4410 0%, transparent 70%)", pointerEvents: "none" }} />

        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #003300, #00CC44, #00FF88, #00CC44, #003300)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Compliance Brain</span>
        </Link>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 32 }}>
            {/* Metallic brain icon */}
            <svg width="64" height="64" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 20 }}>
              <defs>
                <radialGradient id="mg" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#69FF47" />
                  <stop offset="40%" stopColor="#00E676" />
                  <stop offset="70%" stopColor="#00C853" />
                  <stop offset="100%" stopColor="#1B5E20" />
                </radialGradient>
              </defs>
              <circle cx="40" cy="40" r="38" stroke="url(#mg)" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="40" cy="40" r="26" stroke="url(#mg)" strokeWidth="1" strokeOpacity="0.6" />
              <circle cx="40" cy="40" r="14" fill="#00FF8815" stroke="url(#mg)" strokeWidth="1.5" />
              {[[40, 22], [58, 30], [62, 50], [50, 64], [30, 64], [18, 50], [22, 30]].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="3" fill="url(#mg)" opacity="0.9" />
                  <line x1={x} y1={y} x2="40" y2="40" stroke="#00FF88" strokeWidth="0.5" strokeOpacity="0.4" />
                </g>
              ))}
              <circle cx="40" cy="40" r="5" fill="url(#mg)" />
              <circle cx="40" cy="40" r="2" fill="#fff" />
            </svg>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 10 }}>
              AI Compliance<br />
              <span style={{ background: "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                for MENA
              </span>
            </h2>
            <p style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}>Textile, Construction & Pharmaceutical regulations for Pakistan, UAE, Saudi Arabia & Egypt.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Exact page & line references", "PDF compliance reports", "Document analysis", "Monthly updates"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 16, height: 16, background: "#00FF8810", border: "1px solid #00FF8830", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ width: 5, height: 5, background: "#00FF88", borderRadius: "50%" }} />
                </span>
                <span style={{ fontSize: 12, color: "#555" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#1A3A1A" }}>© 2024 Compliance Brain</p>
      </div>

      {/* Right login panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: "#444", marginBottom: 28 }}>Sign in to your account</p>

          {error && (
            <div style={{ background: "#1A0000", border: "1px solid #FF444430", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#FF6666", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Email</label>
              <input type="email" style={inputStyle} placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} style={{ ...inputStyle, paddingRight: 40 }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#333", display: "flex" }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "11px", fontSize: 13, fontWeight: 700,
              background: loading ? "#111" : "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)",
              backgroundSize: "200% auto",
              color: loading ? "#444" : "#0A0A0A", border: "none", borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 0 24px #00FF8830",
              transition: "all 0.2s",
            }}>
              {loading ? "Signing in..." : <><span>Sign in</span><ArrowRight size={13} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: "#333", marginTop: 20 }}>
            No account?{" "}
            <Link href="/auth/signup" style={{ color: "#00FF88", fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}