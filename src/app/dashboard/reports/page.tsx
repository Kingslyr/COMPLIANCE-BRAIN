"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const INDUSTRIES = ["Textile", "Construction", "Pharmaceutical"];
const COUNTRIES = ["Pakistan", "UAE", "Saudi Arabia", "Egypt"];

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState("");
  const [activeReport, setActiveReport] = useState<any>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [form, setForm] = useState({ industry: "Textile", country: "Pakistan", companyName: "" });
  const [genStage, setGenStage] = useState("");
  const [genProgress, setGenProgress] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setForm(f => ({
        ...f,
        industry: data.user!.user_metadata?.industry || "Textile",
        country: data.user!.user_metadata?.country || "Pakistan",
        companyName: data.user!.user_metadata?.company_name || ""
      }));
      const { data: r } = await supabase
        .from("compliance_reports")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });
      setReports(r || []);
      if (r && r.length > 0) setActiveReport(r[0]);
    });
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    setGenProgress(10);
    setGenStage("Fetching regulations...");

    try {
      await new Promise(r => setTimeout(r, 500));
      setGenProgress(35);
      setGenStage("Analyzing compliance requirements...");

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...form })
      });

      setGenProgress(70);
      setGenStage("Generating report...");

      const data = await res.json();

      await new Promise(r => setTimeout(r, 400));
      setGenProgress(100);
      setGenStage("Report ready!");

      if (data.report) {
        setReports(prev => [data.report, ...prev]);
        setActiveReport(data.report);
        setShowForm(false);
      }
    } catch (err) {
      setGenStage("Generation failed.");
    }
    setGenerating(false);
  };

  const downloadPDF = async (report: any) => {
    setDownloadingPdf(true);
    try {
      const { pdf } = await import("@/lib/pdfGenerator");
      await pdf(report);
    } catch (err) {
      console.error(err);
    }
    setDownloadingPdf(false);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "#00FF88";
    if (score >= 60) return "#FFB800";
    return "#FF4444";
  };

  const statusStyle = (s: string) => {
    if (s === "compliant") return { color: "#00FF88", bg: "#00FF8810", border: "#00FF8820" };
    if (s === "non-compliant") return { color: "#FF4444", bg: "#FF444410", border: "#FF444420" };
    return { color: "#FFB800", bg: "#FFB80010", border: "#FFB80020" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "Inter, sans-serif", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .slide-in { animation: slideIn 0.4s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }
        select option { background: #111; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* Sidebar — Reports List */}
        <div style={{ width: 260, flexShrink: 0, background: "#0D0D0D", borderRight: "1px solid #1A1A1A", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px", borderBottom: "1px solid #1A1A1A" }}>
            <h1 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, background: "linear-gradient(135deg, #A855F7, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Compliance Reports
            </h1>
            <button onClick={() => setShowForm(true)}
              style={{ width: "100%", padding: "9px", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #3B1F7A, #A855F7)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer" }}>
              + New Report
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {reports.map(r => (
              <div key={r.id}
                onClick={() => setActiveReport(r)}
                style={{
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4,
                  background: activeReport?.id === r.id ? "#A855F715" : "transparent",
                  border: activeReport?.id === r.id ? "1px solid #A855F730" : "1px solid transparent",
                }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#E5E7EB", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                <p style={{ fontSize: 10, color: "#444" }}>{new Date(r.created_at).toLocaleDateString("en-GB")}</p>
                {r.report_data?.overall_score && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 3, background: "#1A1A1A", borderRadius: 99 }}>
                      <div style={{ width: `${r.report_data.overall_score}%`, height: "100%", background: scoreColor(r.report_data.overall_score), borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 9, color: scoreColor(r.report_data.overall_score), fontWeight: 700 }}>{r.report_data.overall_score}</span>
                  </div>
                )}
              </div>
            ))}
            {reports.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <p style={{ fontSize: 11, color: "#333" }}>No reports yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Generate Form Modal */}
          {showForm && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="slide-in" style={{ background: "#0F0F0F", border: "1px solid #A855F730", borderRadius: 16, padding: "28px", width: 400 }}>
                {generating ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 1.5s infinite" }}>🧠</div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#A855F7", marginBottom: 4 }}>{genStage}</p>
                    <div style={{ background: "#1A1A1A", borderRadius: 99, height: 6, overflow: "hidden", margin: "16px 0" }}>
                      <div style={{ height: "100%", width: `${genProgress}%`, background: "linear-gradient(90deg, #7C3AED, #A855F7)", borderRadius: 99, transition: "width 0.5s ease" }} />
                    </div>
                    <p style={{ fontSize: 11, color: "#444" }}>{genProgress}%</p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#A855F7", marginBottom: 20 }}>Generate Compliance Report</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      {[
                        { label: "Industry", key: "industry", options: INDUSTRIES },
                        { label: "Country", key: "country", options: COUNTRIES },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>{f.label}</label>
                          <select
                            value={(form as any)[f.key]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", fontSize: 12, background: "#111", border: "1px solid #1E1E1E", borderRadius: 9, color: "#fff", outline: "none" }}
                          >
                            {f.options.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                      <div>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>Company Name</label>
                        <input
                          placeholder="Your company name"
                          value={form.companyName}
                          onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                          style={{ width: "100%", padding: "10px 12px", fontSize: 12, background: "#111", border: "1px solid #1E1E1E", borderRadius: 9, color: "#fff", outline: "none" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={generateReport}
                        style={{ flex: 1, padding: "10px", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg, #3B1F7A, #A855F7)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer" }}>
                        Generate Report
                      </button>
                      <button onClick={() => setShowForm(false)}
                        style={{ padding: "10px 16px", fontSize: 12, background: "transparent", color: "#444", border: "1px solid #1E1E1E", borderRadius: 9, cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Report Viewer */}
          {activeReport ? (
            <div style={{ padding: "28px" }} className="slide-in">
              {/* Report Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{activeReport.title}</h2>
                  <p style={{ fontSize: 12, color: "#444" }}>
                    {activeReport.company_name && `${activeReport.company_name} · `}
                    {new Date(activeReport.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <button onClick={() => downloadPDF(activeReport)} disabled={downloadingPdf}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", fontSize: 12, fontWeight: 700, background: downloadingPdf ? "#111" : "linear-gradient(135deg, #3B1F7A, #A855F7)", color: downloadingPdf ? "#444" : "#fff", border: "none", borderRadius: 9, cursor: downloadingPdf ? "not-allowed" : "pointer" }}>
                  {downloadingPdf ? "⏳ Generating..." : "⬇️ Download PDF"}
                </button>
              </div>

              {/* Score + Summary */}
              <div style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: 16, padding: "20px", marginBottom: 16, display: "flex", gap: 20, alignItems: "center" }}>
                {activeReport.report_data?.overall_score && (
                  <div style={{ position: "relative", width: 70, height: 70, flexShrink: 0 }}>
                    <svg width="70" height="70" viewBox="0 0 70 70">
                      <circle cx="35" cy="35" r="28" fill="none" stroke="#1A1A1A" strokeWidth="7" />
                      <circle cx="35" cy="35" r="28" fill="none" stroke={scoreColor(activeReport.report_data.overall_score)}
                        strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={`${activeReport.report_data.overall_score * 1.759} 175.9`}
                        strokeDashoffset="44" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor(activeReport.report_data.overall_score) }}>{activeReport.report_data.overall_score}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#A855F7", marginBottom: 4 }}>Executive Summary</p>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{activeReport.report_data?.summary}</p>
                </div>
              </div>

              {/* Sections */}
              {(activeReport.report_data?.sections || []).map((section: any, si: number) => (
                <div key={si} style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", background: "#111", borderBottom: "1px solid #1E1E1E", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#E5E7EB" }}>{section.category}</p>
                    <span style={{ fontSize: 10, color: "#444" }}>{section.regulations?.length || 0} regulations</span>
                  </div>
                  <div style={{ padding: "12px" }}>
                    {(section.regulations || []).map((reg: any, ri: number) => {
                      const ss = statusStyle(reg.status);
                      return (
                        <div key={ri} style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 10, padding: "14px", marginBottom: ri < section.regulations.length - 1 ? 8 : 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "#E5E7EB" }}>{reg.title}</p>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, textTransform: "uppercase", flexShrink: 0, marginLeft: 8 }}>
                              {reg.status?.replace("-", " ")}
                            </span>
                          </div>
                          <p style={{ fontSize: 10, color: "#555", marginBottom: 5 }}>📌 {reg.reference}</p>
                          <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: reg.penalty ? 5 : 0 }}>{reg.requirement}</p>
                          {reg.penalty && (
                            <p style={{ fontSize: 10, color: "#FF444488" }}>⚠️ Penalty: {reg.penalty}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 64 }}>📊</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>No report selected</p>
              <button onClick={() => setShowForm(true)}
                style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg, #3B1F7A, #A855F7)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer" }}>
                Generate Your First Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}