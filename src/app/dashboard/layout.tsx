"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquare, FileText, Upload, LogOut, Menu, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", glowLeft: true, glowRight: true, glowCenter: true, color: "#00FF88" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Ask Compliance", glowLeft: true, glowRight: false, glowCenter: false, color: "#00FF88" },
  { href: "/dashboard/upload", icon: Upload, label: "Analyze Document", glowLeft: false, glowRight: false, glowCenter: true, color: "#00D4FF" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports", glowLeft: false, glowRight: true, glowCenter: false, color: "#A855F7" },
];

function AnimatedBrain({ glowLeft = false, glowRight = false, glowCenter = false, color = "#00FF88", size = 32 }: {
  glowLeft?: boolean; glowRight?: boolean; glowCenter?: boolean; color?: string; size?: number;
}) {
  const lc = glowLeft ? color : "#1E1E1E";
  const rc = glowRight ? color : "#1E1E1E";
  const cc = glowCenter ? color : "#1E1E1E";
  const lo = glowLeft ? 1 : 0.2;
  const ro = glowRight ? 1 : 0.2;
  const co = glowCenter ? 1 : 0.2;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id={`glowL-${color}`}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`glowR-${color}`}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`glowC-${color}`}>
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g filter={`url(#glowL-${color})`} opacity={lo} style={{ transition: "opacity 0.4s ease" }}>
        <path d="M50 28 C50 28 40 24 33 31 C26 38 26 47 30 53 C25 58 23 65 28 71 C33 77 42 78 47 76 C49 80 50 82 50 82"
          stroke={lc} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M38 40 C41 37 45 39 45 44" stroke={lc} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M32 54 C36 50 43 52 42 58" stroke={lc} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M34 66 C38 63 44 65 43 70" stroke={lc} strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="37" cy="46" r="2" fill={lc} />
        <circle cx="34" cy="61" r="2" fill={lc} />
      </g>

      <g filter={`url(#glowR-${color})`} opacity={ro} style={{ transition: "opacity 0.4s ease" }}>
        <path d="M50 28 C50 28 60 24 67 31 C74 38 74 47 70 53 C75 58 77 65 72 71 C67 77 58 78 53 76 C51 80 50 82 50 82"
          stroke={rc} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M62 40 C59 37 55 39 55 44" stroke={rc} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M68 54 C64 50 57 52 58 58" stroke={rc} strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M66 66 C62 63 56 65 57 70" stroke={rc} strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="63" cy="46" r="2" fill={rc} />
        <circle cx="66" cy="61" r="2" fill={rc} />
      </g>

      <g filter={`url(#glowC-${color})`} opacity={co} style={{ transition: "opacity 0.4s ease" }}>
        <line x1="50" y1="28" x2="50" y2="82" stroke={cc} strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="50" cy="50" r="4" fill={cc} />
        <line x1="37" y1="46" x2="50" y2="50" stroke={cc} strokeWidth="0.8" opacity="0.5" />
        <line x1="63" y1="46" x2="50" y2="50" stroke={cc} strokeWidth="0.8" opacity="0.5" />
        <line x1="34" y1="61" x2="50" y2="50" stroke={cc} strokeWidth="0.8" opacity="0.5" />
        <line x1="66" y1="61" x2="50" y2="50" stroke={cc} strokeWidth="0.8" opacity="0.5" />
      </g>
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const activeNav = NAV.find(n => n.href === pathname) || NAV[0];

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
      <div style={{ padding: "16px 14px", borderBottom: "1px solid #1A1A1A" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <AnimatedBrain
            glowLeft={activeNav.glowLeft}
            glowRight={activeNav.glowRight}
            glowCenter={activeNav.glowCenter}
            color={activeNav.color}
            size={30}
          />
          <span style={{ fontWeight: 700, fontSize: 13, color: "#fff", letterSpacing: "-0.01em", fontFamily: "Inter, sans-serif" }}>Compliance Brain</span>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(n => {
          const active = pathname === n.href;
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
                fontSize: 12, fontWeight: active ? 600 : 500,
                color: active ? n.color : "#555",
                background: active ? `${n.color}12` : "transparent",
                border: active ? `1px solid ${n.color}25` : "1px solid transparent",
                textDecoration: "none", transition: "all 0.2s", fontFamily: "Inter, sans-serif",
                boxShadow: active ? `0 0 12px ${n.color}10` : "none",
              }}>
              <Icon size={13} strokeWidth={active ? 2.5 : 2} />
              {n.label}
            </Link>
          );
        })}
      </nav>

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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 99px; }
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } }
      `}</style>

      <aside style={{ width: 200, flexShrink: 0 }} className="hidden-mobile">
        <Sidebar />
      </aside>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} />
          <aside style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 200, zIndex: 51 }}>
            <Sidebar />
          </aside>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: "#0D0D0D", borderBottom: "1px solid #1A1A1A", height: 46, display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between" }} className="show-mobile">
          <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex" }}>
            <Menu size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AnimatedBrain glowLeft={activeNav.glowLeft} glowRight={activeNav.glowRight} glowCenter={activeNav.glowCenter} color={activeNav.color} size={22} />
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