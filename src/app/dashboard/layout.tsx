"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Zap, MessageSquare, FileText, Upload, LogOut, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard", icon: Zap, label: "Dashboard" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Ask Compliance" },
  { href: "/dashboard/upload", icon: Upload, label: "Analyze Document" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUserName(data.user.user_metadata?.full_name || "");
      setUserEmail(data.user.email || "");
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const Sidebar = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0D0D0D", borderRight: "1px solid #1A1A1A" }}>
      {/* Logo */}
      <div style={{ padding: "16px 14px", borderBottom: "1px solid #1A1A1A" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #00FF88, #00D4AA)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={13} color="#0A0A0A" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#fff", letterSpacing: "-0.01em", fontFamily: "Inter, sans-serif" }}>Compliance Brain</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(n => {
          const active = pathname === n.href;
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
                fontSize: 12, fontWeight: active ? 600 : 500,
                color: active ? "#00FF88" : "#555",
                background: active ? "#00FF8810" : "transparent",
                border: active ? "1px solid #00FF8820" : "1px solid transparent",
                textDecoration: "none", transition: "all 0.15s", fontFamily: "Inter, sans-serif"
              }}>
              <n.icon size={13} strokeWidth={active ? 2.5 : 2} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid #1A1A1A" }}>
        <div style={{ padding: "8px 10px", borderRadius: 8, background: "#141414", marginBottom: 4, border: "1px solid #1E1E1E" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#E5E7EB", lineHeight: 1, marginBottom: 2, fontFamily: "Inter, sans-serif" }}>{userName || "User"}</p>
          <p style={{ fontSize: 10, color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "Inter, sans-serif" }}>{userEmail}</p>
        </div>
        <button onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500, color: "#444", background: "transparent", border: "1px solid transparent", cursor: "pointer", width: "100%", transition: "all 0.15s", fontFamily: "Inter, sans-serif" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1A0000"; e.currentTarget.style.color = "#FF4444"; e.currentTarget.style.borderColor = "#FF444420"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; e.currentTarget.style.borderColor = "transparent"; }}>
          <LogOut size={11} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0A0A0A", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } }
      `}</style>

      {/* Desktop sidebar */}
      <aside style={{ width: 200, flexShrink: 0 }} className="hidden-mobile">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} />
          <aside style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 200, zIndex: 51 }}>
            <Sidebar />
          </aside>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Mobile topbar */}
        <div style={{ background: "#0D0D0D", borderBottom: "1px solid #1A1A1A", height: 46, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between" }} className="show-mobile">
          <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex" }}>
            <Menu size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 22, background: "linear-gradient(135deg, #00FF88, #00D4AA)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={11} color="#0A0A0A" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#fff" }}>Compliance Brain</span>
          </div>
          <div style={{ width: 18 }} />
        </div>

        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
// METALLIC GREEN GRADIENT REFERENCE:
// background: linear-gradient(135deg, #00C853, #69FF47, #00E676, #1B5E20, #00FF88, #76FF03)
// For shiny metallic effect: linear-gradient(135deg, #003300 0%, #00CC44 30%, #00FF88 50%, #00CC44 70%, #003300 100%)