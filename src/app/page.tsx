"use client";
import Link from "next/link";
import { ArrowRight, FileText, Upload, MessageSquare } from "lucide-react";

const MG = "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)";

// Same animated brain as dashboard
function AnimatedBrain({ size = 32, color = "#00FF88" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="heroGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Left hemisphere */}
      <path d="M50 28 C50 28 40 24 33 31 C26 38 26 47 30 53 C25 58 23 65 28 71 C33 77 42 78 47 76 C49 80 50 82 50 82"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" filter="url(#heroGlow)" opacity="0.9" />
      <path d="M38 40 C41 37 45 39 45 44" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M32 54 C36 50 43 52 42 58" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M34 66 C38 63 44 65 43 70" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Right hemisphere */}
      <path d="M50 28 C50 28 60 24 67 31 C74 38 74 47 70 53 C75 58 77 65 72 71 C67 77 58 78 53 76 C51 80 50 82 50 82"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" filter="url(#heroGlow)" opacity="0.9" />
      <path d="M62 40 C59 37 55 39 55 44" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M68 54 C64 50 57 52 58 58" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M66 66 C62 63 56 65 57 70" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Center */}
      <line x1="50" y1="28" x2="50" y2="82" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <circle cx="50" cy="50" r="4" fill={color} filter="url(#heroGlow)" />
      <circle cx="37" cy="46" r="2" fill={color} opacity="0.6" />
      <circle cx="63" cy="46" r="2" fill={color} opacity="0.6" />
      <circle cx="34" cy="61" r="2" fill={color} opacity="0.6" />
      <circle cx="66" cy="61" r="2" fill={color} opacity="0.6" />
      <line x1="37" y1="46" x2="50" y2="50" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="63" y1="46" x2="50" y2="50" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="34" y1="61" x2="50" y2="50" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <line x1="66" y1="61" x2="50" y2="50" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0A0A0A", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        .mg-text {
          background: linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { to { background-position: 200% center; } }
        .brain-pulse { animation: pulse 3s ease-in-out infinite; }
        @keyframes pulse {
          0%,100% { filter: drop-shadow(0 0 12px #00FF8866); }
          50% { filter: drop-shadow(0 0 28px #00FF88AA); }
        }
        .card-dark {
          background: #111; border: 1px solid #1E1E1E;
          border-radius: 12px; padding: 18px; transition: all 0.2s;
        }
        .card-dark:hover {
          border-color: #00FF8825; background: #141414;
          transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,255,136,0.06);
        }
        .btn-neon {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; font-size: 13px; font-weight: 700;
          border-radius: 9px; border: none; cursor: pointer;
          font-family: inherit;
          background: linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300);
          background-size: 200% auto;
          color: #0A0A0A; box-shadow: 0 0 20px rgba(0,255,136,0.25);
          transition: all 0.2s;
        }
        .btn-neon:hover { box-shadow: 0 0 32px rgba(0,255,136,0.4); transform: translateY(-1px); }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; font-size: 13px; font-weight: 500;
          border-radius: 9px; border: 1px solid #222; cursor: pointer;
          font-family: inherit; background: transparent; color: #666; transition: all 0.2s;
        }
        .btn-outline:hover { border-color: #333; color: #fff; }
        .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        @media(max-width:768px) { .grid-3{grid-template-columns:1fr;} }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #141414", position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)", height: 50 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AnimatedBrain size={28} color="#00FF88" />
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em" }}>Compliance Brain</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/auth/login"><button className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>Sign in</button></Link>
            <Link href="/auth/signup"><button className="btn-neon" style={{ padding: "6px 14px", fontSize: 12 }}>Get started</button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div className="brain-pulse" style={{ marginBottom: 16 }}>
          <AnimatedBrain size={80} color="#00FF88" />
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#00FF8808", border: "1px solid #00FF8820", borderRadius: 999, padding: "3px 12px", fontSize: 10, fontWeight: 700, color: "#00FF88", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
          AI · Compliance · MENA Region
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 12, maxWidth: 560 }}>
          <span className="mg-text">The smartest way to stay compliant</span>
        </h1>

        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, maxWidth: 400, marginBottom: 24 }}>
          AI-powered compliance for Textile, Construction & Pharmaceutical industries across Pakistan, UAE, Saudi Arabia & Egypt.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
          <Link href="/auth/signup"><button className="btn-neon">Get started free <ArrowRight size={13} /></button></Link>
          <Link href="/auth/login"><button className="btn-outline">Sign in</button></Link>
        </div>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {[["12", "Industry combos"], ["3", "Industries"], ["4", "MENA countries"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }} className="mg-text">{n}</p>
              <p style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 20px 56px" }}>
        <div className="grid-3">
          {[
            { icon: MessageSquare, title: "AI Chatbot", desc: "Exact answers with document, section, page & line references.", color: "#00FF88" },
            { icon: Upload, title: "Document Analysis", desc: "Upload docs. AI instantly checks compliance gaps.", color: "#00D4FF" },
            { icon: FileText, title: "PDF Reports", desc: "Professional compliance reports generated in seconds.", color: "#A855F7" },
          ].map(f => (
            <div key={f.title} className="card-dark">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: f.color + "12", border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <f.icon size={14} color={f.color} />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#E5E7EB", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 11, color: "#444", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 20px 56px" }}>
        <div style={{ background: "#0F0F0F", border: "1px solid #1A1A1A", borderRadius: 14, padding: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle, #00FF8806 0%, transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: "#00FF88", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>Regulation coverage</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["Textile · Pakistan", "Textile · UAE", "Textile · Saudi Arabia", "Textile · Egypt", "Construction · Pakistan", "Construction · UAE", "Construction · Saudi Arabia", "Construction · Egypt", "Pharmaceutical · Pakistan", "Pharmaceutical · UAE", "Pharmaceutical · Saudi Arabia", "Pharmaceutical · Egypt"].map(tag => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 500, background: "#141414", border: "1px solid #1E1E1E", borderRadius: 5, padding: "3px 9px", color: "#555", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 4, height: 4, background: "#00FF88", borderRadius: "50%", flexShrink: 0 }} />{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "0 20px 64px" }}>
        <div style={{ background: "linear-gradient(135deg, #0A1A0A, #0D1F0D)", border: "1px solid #1A2A1A", borderRadius: 16, padding: "40px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, background: "radial-gradient(circle, #00FF8806 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="brain-pulse" style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <AnimatedBrain size={48} color="#00FF88" />
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#00FF88", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Start today</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Ready to be compliant?</h2>
          <p style={{ fontSize: 12, color: "#444", marginBottom: 22 }}>Join companies across Pakistan and MENA.</p>
          <Link href="/auth/signup"><button className="btn-neon" style={{ fontSize: 13, padding: "10px 24px" }}>Get started free <ArrowRight size={13} /></button></Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #111", padding: "16px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#2A2A2A" }}>© 2024 Compliance Brain · AI compliance for MENA industries</p>
      </footer>
    </div>
  );
}