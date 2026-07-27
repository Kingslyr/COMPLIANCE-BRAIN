"use client";
import { useState, useEffect } from "react";
import { FileText, Download, Plus, CheckCircle, AlertCircle, Clock, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MG = "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)";
const INDUSTRIES = ["Textile", "Construction", "Pharmaceutical"];
const COUNTRIES = ["Pakistan", "UAE", "Saudi Arabia", "Egypt"];

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState({ industry: "", country: "", companyName: "" });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setForm(f => ({ ...f, industry: data.user!.user_metadata?.industry || "", country: data.user!.user_metadata?.country || "", companyName: data.user!.user_metadata?.company_name || "" }));
      const { data: r } = await supabase.from("compliance_reports").select("*").eq("user_id", data.user.id).order("created_at", { ascending: false });
      setReports(r || []);
    });
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ...form }) });
    const { report } = await res.json();
    if (report) setReports(prev => [report, ...prev]);
    setGenerating(false);
    setShowForm(false);
  };

  const downloadPDF = async (report: any) => {
    const { pdf } = await import("@/lib/pdfGenerator");
    await pdf(report);
  };

  const inp: React.CSSProperties = { width: "100%", padding: "8px 12px", fontSize: 12, background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, outline: "none", color: "#fff", fontFamily: "inherit", cursor: "pointer" };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 860, margin: "0 auto", fontFamily: "Inter, sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input::placeholder{color:#333} select option{background:#111}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, background: MG, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "200% auto", letterSpacing: "-0.02em" }}>Compliance Reports</h1>
          <p style={{ fontSize: 12, color: "#444", marginTop: 3 }}>Generate and download PDF compliance reports</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 12, fontWeight: 700, background: MG, backgroundSize: "200% auto", color: "#0A0A0A", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={13} /> New report
        </button>
      </div>

      {/* Generate form */}
      {showForm && (
        <div style={{ background: "#0F0F0F", border: "1px solid #00FF8820", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#00FF88", marginBottom: 16 }}>Generate new report</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Industry</label>
              <select style={inp} value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                <option value="">Select</option>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Country</label>
              <select style={inp} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                <option value="">Select</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#333", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Company</label>
              <input style={inp} placeholder="Your company" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={generateReport} disabled={generating || !form.industry || !form.country}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", fontSize: 12, fontWeight: 700, background: generating ? "#111" : MG, backgroundSize: "200% auto", color: generating ? "#444" : "#0A0A0A", border: "none", borderRadius: 8, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {generating ? <><Loader size={12} style={{ animation: "spin 0.7s linear infinite" }} /> Generating...</> : <><FileText size={12} /> Generate PDF</>}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 500, background: "transparent", color: "#444", border: "1px solid #1E1E1E", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Reports list */}
      {reports.length === 0 ? (
        <div style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", borderRadius: 12, padding: "48px", textAlign: "center" }}>
          <FileText size={28} color="#222" style={{ margin: "0 auto 10px" }} />
          <p style={{ fontSize: 12, color: "#333" }}>No reports yet. Generate your first compliance report.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reports.map(r => (
            <div key={r.id} style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", borderRadius: 12, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#E5E7EB", marginBottom: 3 }}>{r.title}</p>
                  <p style={{ fontSize: 11, color: "#333" }}>{r.company_name && `${r.company_name} · `}{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <button onClick={() => downloadPDF(r)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", fontSize: 11, fontWeight: 600, background: "#00FF8810", color: "#00FF88", border: "1px solid #00FF8820", borderRadius: 7, cursor: "pointer", fontFamily: "inherit" }}>
                  <Download size={11} /> Download PDF
                </button>
              </div>
              {r.report_data?.summary && <p style={{ fontSize: 12, color: "#444", lineHeight: 1.6, marginBottom: 10 }}>{r.report_data.summary}</p>}
              {r.report_data?.sections && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {r.report_data.sections.map((s: any) => (
                    <span key={s.category} style={{ fontSize: 10, fontWeight: 600, background: "#1A1A1A", border: "1px solid #222", color: "#444", borderRadius: 5, padding: "3px 8px" }}>{s.category} ({s.regulations?.length || 0})</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}