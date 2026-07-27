"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, BookOpen, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ChatMessage, ChatSession } from "@/lib/supabase";

const MG = "linear-gradient(135deg, #003300, #00CC44, #69FF47, #00CC44, #003300)";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      setIndustry(data.user.user_metadata?.industry || "Textile");
      setCountry(data.user.user_metadata?.country || "Pakistan");
      const { data: s } = await supabase.from("chat_sessions").select("*").eq("user_id", data.user.id).order("updated_at", { ascending: false }).limit(20);
      setSessions(s || []);
    });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const newSession = async () => {
    const { data } = await supabase.from("chat_sessions").insert({ user_id: userId, title: "New conversation", industry, country }).select().single();
    if (data) { setSessions(prev => [data, ...prev]); setCurrentSession(data.id); setMessages([]); }
  };

  const loadSession = async (id: string) => {
    setCurrentSession(id);
    const { data } = await supabase.from("chat_messages").select("*").eq("session_id", id).order("created_at");
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    let sessionId = currentSession;
    if (!sessionId) {
      const { data } = await supabase.from("chat_sessions").insert({ user_id: userId, title: input.slice(0, 60), industry, country }).select().single();
      if (data) { sessionId = data.id; setCurrentSession(data.id); setSessions(prev => [data, ...prev]); }
    }
    const userMsg = { id: Date.now().toString(), session_id: sessionId!, user_id: userId, role: "user" as const, content: input, references: null, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: input, sessionId, userId, industry, country }) });
    const data = await res.json();
    setLoading(false);
    if (data.message) {
      const aiMsg = { id: (Date.now() + 1).toString(), session_id: sessionId!, user_id: userId, role: "assistant" as const, content: data.message, references: data.references || null, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", background: "#0A0A0A", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} a{text-decoration:none;} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#1E1E1E;border-radius:99px}`}</style>

      {/* Sessions sidebar */}
      <div style={{ width: 200, borderRight: "1px solid #1A1A1A", background: "#0D0D0D", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px" }}>
          <button onClick={newSession} style={{ width: "100%", padding: "8px 12px", fontSize: 12, fontWeight: 600, background: MG, backgroundSize: "200% auto", color: "#0A0A0A", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
            <Plus size={13} /> New chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          {sessions.map(s => (
            <button key={s.id} onClick={() => loadSession(s.id)}
              style={{ width: "100%", textAlign: "left", padding: "7px 8px", borderRadius: 7, fontSize: 11, fontWeight: 500, background: currentSession === s.id ? "#00FF8810" : "transparent", color: currentSession === s.id ? "#00FF88" : "#444", border: currentSession === s.id ? "1px solid #00FF8820" : "1px solid transparent", cursor: "pointer", fontFamily: "inherit", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {s.title || "Conversation"}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, background: "#00FF8810", border: "1px solid #00FF8820", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={22} color="#00FF88" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, background: MG, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 4 }}>Ask anything about compliance</p>
                <p style={{ fontSize: 12, color: "#444" }}>Exact regulation references for {industry} in {country}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {["What are fire safety requirements?", "Environmental discharge limits?", "Worker safety regulations?"].map(q => (
                  <button key={q} onClick={() => setInput(q)} style={{ fontSize: 11, background: "#111", border: "1px solid #222", color: "#555", padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#00FF8830"; e.currentTarget.style.color = "#00FF88"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#555"; }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} style={{ display: "flex", gap: 10, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ width: 28, height: 28, background: "#00FF8810", border: "1px solid #00FF8820", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={13} color="#00FF88" />
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                <div style={{ padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", background: m.role === "user" ? "linear-gradient(135deg, #003300, #00AA33)" : "#111", color: m.role === "user" ? "#fff" : "#ccc", border: m.role === "assistant" ? "1px solid #1E1E1E" : "none" }}>
                  {m.content}
                </div>
                {m.references && m.references.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {m.references.map((r: any, i: number) => (
                      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#00FF8810", border: "1px solid #00FF8820", color: "#00FF88", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5 }}>
                        <BookOpen size={9} /> {r.doc_name} · Pg {r.page}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div style={{ width: 28, height: 28, background: "#1A1A1A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={13} color="#555" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, background: "#00FF8810", border: "1px solid #00FF8820", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={13} color="#00FF88" />
              </div>
              <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "#111", border: "1px solid #1E1E1E", display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 150, 300].map(d => <span key={d} style={{ width: 6, height: 6, background: "#00FF88", borderRadius: "50%", display: "inline-block", animation: "bounce 1.2s infinite ease-in-out", animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1A1A1A", background: "#0D0D0D", display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, padding: "10px 14px", fontSize: 13, background: "#111", border: "1px solid #1E1E1E", borderRadius: 10, outline: "none", color: "#fff", fontFamily: "inherit" }}
            placeholder={`Ask about ${industry} compliance in ${country}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            onFocus={e => e.target.style.borderColor = "#00FF8840"}
            onBlur={e => e.target.style.borderColor = "#1E1E1E"}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ width: 42, height: 42, background: input.trim() ? MG : "#111", backgroundSize: "200% auto", border: "none", borderRadius: 10, cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Send size={15} color={input.trim() ? "#0A0A0A" : "#333"} />
          </button>
        </div>
      </div>
    </div>
  );
}