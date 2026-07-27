"use client";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, Loader, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const MG = "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)";

export default function UploadPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setIndustry(data.user.user_metadata?.industry || "Textile");
      setCountry(data.user.user_metadata?.country || "Pakistan");
      const { data: d } = await supabase.from("uploaded_documents").select("*").eq("user_id", data.user.id).order("created_at", { ascending: false });
      setDocs(d || []);
    });
  }, []);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("documents").upload(path, file);
    if (uploadErr) { setUploading(false); return; }
    const { data: doc } = await supabase.from("uploaded_documents").insert({ user_id: userId, file_name: file.name, file_path: path, file_size: file.size, industry, country, analysis_status: "analyzing" }).select().single();
    if (doc) {
      setDocs(prev => [doc, ...prev]);
      const res = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ docId: doc.id, userId, industry, country, fileName: file.name }) });
      const { result } = await res.json();
      await supabase.from("uploaded_documents").update({ analysis_status: "done", analysis_result: result }).eq("id", doc.id);
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, analysis_status: "done", analysis_result: result } : d));
    }
    setUploading(false);
  }, [userId, industry, country]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"], "application/msword": [".doc"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] }, maxFiles: 1 });

  const deleteDoc = async (id: string) => {
    await supabase.from("uploaded_documents").delete().eq("id", id);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 720, margin: "0 auto", fontFamily: "Inter, sans-serif", color: "#fff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, background: MG, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "200% auto", letterSpacing: "-0.02em" }}>Analyze Document</h1>
        <p style={{ fontSize: 12, color: "#444", marginTop: 3 }}>Upload your company documents for AI compliance check</p>
      </div>

      {/* Dropzone */}
      <div {...getRootProps()} style={{ border: `1.5px dashed ${isDragActive ? "#00FF88" : "#1E1E1E"}`, borderRadius: 14, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: isDragActive ? "#00FF8808" : "#0F0F0F", transition: "all 0.2s", marginBottom: 24 }}>
        <input {...getInputProps()} />
        <div style={{ width: 44, height: 44, background: uploading || isDragActive ? "#00FF8815" : "#111", border: `1px solid ${isDragActive ? "#00FF8840" : "#1E1E1E"}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          {uploading ? <Loader size={20} color="#00FF88" style={{ animation: "spin 0.7s linear infinite" }} /> : <Upload size={20} color={isDragActive ? "#00FF88" : "#333"} />}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: isDragActive ? "#00FF88" : "#555", marginBottom: 4 }}>
          {uploading ? "Analyzing document..." : isDragActive ? "Drop it here" : "Drop your document here"}
        </p>
        <p style={{ fontSize: 11, color: "#333", marginBottom: 14 }}>PDF, DOC, DOCX · Max 10MB</p>
        {!uploading && (
          <button type="button" style={{ padding: "8px 20px", fontSize: 12, fontWeight: 700, background: MG, backgroundSize: "200% auto", color: "#0A0A0A", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>Browse files</button>
        )}
      </div>

      {/* Docs list */}
      {docs.length > 0 && (
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#333", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Your documents</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map(d => (
              <div key={d.id} style={{ background: "#0F0F0F", border: "1px solid #1E1E1E", borderRadius: 10, padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: d.analysis_result ? 10 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={14} color="#444" />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#E5E7EB", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.file_name}</p>
                      <p style={{ fontSize: 10, color: "#333" }}>{d.industry} · {d.country}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {d.analysis_status === "done" && <span style={{ fontSize: 10, fontWeight: 600, background: "#00FF8810", color: "#00FF88", border: "1px solid #00FF8820", borderRadius: 5, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={9} /> Done</span>}
                    {d.analysis_status === "analyzing" && <span style={{ fontSize: 10, fontWeight: 600, background: "#111", color: "#444", border: "1px solid #1E1E1E", borderRadius: 5, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}><Loader size={9} /> Analyzing</span>}
                    {d.analysis_status === "error" && <span style={{ fontSize: 10, fontWeight: 600, background: "#1A0000", color: "#FF4444", border: "1px solid #FF444420", borderRadius: 5, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={9} /> Error</span>}
                    <button onClick={() => deleteDoc(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#222", display: "flex", padding: 4 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#FF4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "#222"}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {d.analysis_result && (
                  <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#00FF88", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>Analysis</p>
                    <p style={{ fontSize: 11, color: "#444", lineHeight: 1.6 }}>
                      {typeof d.analysis_result === "string" ? d.analysis_result : d.analysis_result?.summary || JSON.stringify(d.analysis_result).slice(0, 200)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}