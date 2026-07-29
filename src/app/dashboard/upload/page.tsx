"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [userId, setUserId] = useState("");
  const [industry, setIndustry] = useState("Textile");
  const [country, setCountry] = useState("Pakistan");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [docs, setDocs] = useState<any[]>([]);
  const [activeDoc, setActiveDoc] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setIndustry(data.user.user_metadata?.industry || "Textile");
      setCountry(data.user.user_metadata?.country || "Pakistan");
      const { data: d } = await supabase
        .from("uploaded_documents")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });
      setDocs(d || []);
    });
  }, []);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file || !userId) return;

    setUploading(true);
    setResult(null);
    setFileName(file.name);
    setProgress(10);
    setStage("Reading document...");

    try {
      await new Promise(r => setTimeout(r, 600));
      setProgress(30);
      setStage("Extracting content...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
      formData.append("industry", industry);
      formData.append("country", country);

      await new Promise(r => setTimeout(r, 400));
      setProgress(50);
      setStage("Comparing with regulations...");

      const res = await fetch("/api/upload", { method: "POST", body: formData });

      setProgress(80);
      setStage("Generating insights...");

      const data = await res.json();

      await new Promise(r => setTimeout(r, 400));
      setProgress(100);
      setStage("Analysis complete!");

      if (data.result) {
        setResult(data.result);
        if (data.doc) {
          setDocs(prev => [data.doc, ...prev]);
          setActiveDoc(data.doc);
        }
      }
    } catch (err) {
      setStage("Analysis failed. Please try again.");
    }

    setUploading(false);
  }, [userId, industry, country]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
    maxFiles: 1,
    disabled: uploading
  });

  const scoreColor = (score: number) => {
    if (score >= 80) return "#00FF88";
    if (score >= 60) return "#FFB800";
    return "#FF4444";
  };

  const severityColor = (s: string) => {
    if (s === "high") return { bg: "#1A0000", color: "#FF4444", border: "#FF444430" };
    if (s === "medium") return { bg: "#1A1000", color: "#FFB800", border: "#FFB80030" };
    return { bg: "#001A00", color: "#00FF88", border: "#00FF8830" };
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "#FF4444";
    if (p === "medium") return "#FFB800";
    return "#00FF88";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "Inter, sans-serif", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fillBar { from { width: 0%; } to { width: var(--w); } }
        .slide-in { animation: slideIn 0.5s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #00D4FF20, #00D4FF10)", border: "1px solid #00D4FF30", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📄</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
              <span style={{ background: "linear-gradient(135deg, #00D4FF, #0088FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Document Analysis</span>
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#444", marginLeft: 46 }}>Upload your documents for AI-powered compliance analysis with real regulation references</p>
        </div>

        {/* Selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Industry", value: industry, set: setIndustry, options: ["Textile", "Construction", "Pharmaceutical"] },
            { label: "Country", value: country, set: setCountry, options: ["Pakistan", "UAE", "Saudi Arabia", "Egypt"] },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{f.label}</label>
              <select
                value={f.value}
                onChange={e => f.set(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", fontSize: 13, background: "#111", border: "1px solid #1E1E1E", borderRadius: 10, color: "#fff", outline: "none", cursor: "pointer" }}
              >
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Dropzone */}
        {!uploading && !result && (
          <div {...getRootProps()} style={{
            border: `2px dashed ${isDragActive ? "#00D4FF" : "#1E1E1E"}`,
            borderRadius: 16,
            padding: "60px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragActive ? "#00D4FF05" : "#0D0D0D",
            transition: "all 0.3s",
            marginBottom: 24,
          }}>
            <input {...getInputProps()} />
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: isDragActive ? "#00D4FF" : "#555", marginBottom: 8 }}>
              {isDragActive ? "Drop your document here!" : "Drop your compliance document here"}
            </p>
            <p style={{ fontSize: 12, color: "#333", marginBottom: 20 }}>PDF, DOC, DOCX · Max 10MB</p>
            <button type="button" style={{
              padding: "10px 24px", fontSize: 13, fontWeight: 700,
              background: "linear-gradient(135deg, #003344, #00D4FF)",
              color: "#fff", border: "none", borderRadius: 10, cursor: "pointer"
            }}>
              Browse Files
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="slide-in" style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: 16, padding: "32px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, animation: "pulse 1.5s infinite" }}>🧠</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#00D4FF", marginBottom: 4 }}>{stage}</p>
            <p style={{ fontSize: 11, color: "#333", marginBottom: 20 }}>{fileName}</p>
            <div style={{ background: "#1A1A1A", borderRadius: 99, height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00D4FF, #0088FF)",
                borderRadius: 99,
                transition: "width 0.5s ease"
              }} />
            </div>
            <p style={{ fontSize: 11, color: "#333", marginTop: 8 }}>{progress}%</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="slide-in">
            {/* Score Card */}
            <div style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: 16, padding: "24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#1A1A1A" strokeWidth="8" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor(result.overall_score || 70)}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(result.overall_score || 70) * 2.136} 213.6`}
                    strokeDashoffset="53.4" style={{ transition: "stroke-dasharray 1s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(result.overall_score || 70) }}>{result.overall_score || 70}</span>
                  <span style={{ fontSize: 8, color: "#444" }}>/ 100</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Compliance Score</h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: result.risk_level === "low" ? "#00FF8815" : result.risk_level === "high" ? "#FF444415" : "#FFB80015",
                    color: result.risk_level === "low" ? "#00FF88" : result.risk_level === "high" ? "#FF4444" : "#FFB800",
                    border: `1px solid ${result.risk_level === "low" ? "#00FF8830" : result.risk_level === "high" ? "#FF444430" : "#FFB80030"}`,
                    textTransform: "uppercase"
                  }}>
                    {result.risk_level || "medium"} risk
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{result.summary}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Compliant Areas */}
              <div style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: 16, padding: "20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#00FF88", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>✅ Compliant Areas</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(result.compliant_areas || []).map((a: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "#00FF88", marginTop: 1, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps */}
              <div style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: 16, padding: "20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#FF4444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>⚠️ Compliance Gaps</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(result.gaps || []).map((g: any, i: number) => {
                    const sc = severityColor(g.severity);
                    return (
                      <div key={i} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#E5E7EB" }}>{g.issue}</p>
                          <span style={{ fontSize: 9, fontWeight: 700, color: sc.color, textTransform: "uppercase", flexShrink: 0, marginLeft: 6 }}>{g.severity}</span>
                        </div>
                        <p style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>{g.regulation}</p>
                        <p style={{ fontSize: 11, color: "#666" }}>→ {g.action}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: 16, padding: "20px", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>💡 Recommendations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(result.recommendations || []).map((r: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: 99, background: `${priorityColor(r.priority)}15`, border: `1px solid ${priorityColor(r.priority)}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: priorityColor(r.priority) }}>{i + 1}</div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#E5E7EB", marginBottom: 2 }}>{r.title}</p>
                      <p style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyze Another */}
            <button onClick={() => { setResult(null); setFileName(""); setProgress(0); setStage(""); }}
              style={{ width: "100%", padding: "12px", fontSize: 13, fontWeight: 700, background: "#111", border: "1px solid #1E1E1E", borderRadius: 10, color: "#555", cursor: "pointer" }}>
              + Analyze Another Document
            </button>
          </div>
        )}

        {/* Previous Docs */}
        {!result && docs.length > 0 && !uploading && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#333", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Previous Analyses</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {docs.map(d => (
                <div key={d.id}
                  onClick={() => { setResult(d.analysis_result); setFileName(d.file_name); setActiveDoc(d); }}
                  style={{ background: "#0D0D0D", border: `1px solid ${activeDoc?.id === d.id ? "#00D4FF30" : "#1E1E1E"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#E5E7EB" }}>{d.file_name}</p>
                      <p style={{ fontSize: 10, color: "#333" }}>{d.industry} · {d.country} · {new Date(d.created_at).toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "#00FF8810", color: "#00FF88", border: "1px solid #00FF8820" }}>
                    {d.analysis_result?.overall_score || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}