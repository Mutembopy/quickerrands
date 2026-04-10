import { useState, useEffect, useRef } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  primary: "rgb(37, 99, 235)",
  secondary: "rgb(96, 165, 250)",
  background: "rgb(224, 242, 254)",
  dark: "rgb(15, 23, 42)",
  accent: "rgb(14, 165, 233)",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  surface: "rgba(255,255,255,0.92)",
  muted: "#64748b",
  border: "rgba(37,99,235,0.15)",
};

// ─── SEED DATA ─────────────────────────────────────────────────────────────────
const SEED = {
  agents: [
    {
      id: "a1", name: "Chilufya Banda", phone: "0977 123 456", nrc: "123456/78/1",
      status: "approved", rating: 4.8, jobs: 142, bio: "Experienced errand runner based in Solwezi. Specialise in banking, ZRA, and grocery errands.",
      skills: ["Banking Errands", "ZRA/PACRA", "Grocery Shopping", "Parcel Delivery"],
      experience: "3 years handling corporate and individual errands across North-Western Province.",
      areas: ["Solwezi CBD", "Mushindamo", "Chingola Road"],
      availability: "Mon–Sat, 07:00–18:00",
      avatar: "CB", color: "#2563eb",
    },
    {
      id: "a2", name: "Mutale Phiri", phone: "0966 234 567", nrc: "234567/89/2",
      status: "approved", rating: 4.6, jobs: 98, bio: "Fast and reliable runner. Former logistics officer. Handle deliveries and pharmacy pickups with care.",
      skills: ["Pharmacy Pickups", "Parcel Delivery", "Utility Payments", "Queueing"],
      experience: "2 years, previously with Swift Logistics Zambia.",
      areas: ["Solwezi", "Kasempa", "Mwinilunga Road"],
      availability: "Mon–Fri, 08:00–17:00",
      avatar: "MP", color: "#0891b2",
    },
    {
      id: "a3", name: "Natasha Zimba", phone: "0955 345 678", nrc: "345678/90/3",
      status: "pending", rating: 0, jobs: 0, bio: "New to the platform. Eager and punctual. Available for all errand types.",
      skills: ["Shopping", "Queueing", "Parcel Delivery"],
      experience: "Volunteer community runner for 1 year.",
      areas: ["Solwezi CBD"],
      availability: "Mon–Sun, 09:00–16:00",
      avatar: "NZ", color: "#7c3aed",
    },
    {
      id: "a4", name: "Benson Mwale", phone: "0977 456 789", nrc: "456789/01/4",
      status: "rejected", rating: 0, jobs: 0, bio: "",
      skills: [], experience: "", areas: [], availability: "",
      avatar: "BM", color: "#dc2626",
    },
  ],
  bookings: [
    {
      id: "b1", userId: "u1", service: "Queueing", location: "Solwezi FNB Branch",
      date: "2026-04-08", time: "09:00", status: "completed",
      agentId: "a1", price: 85, paid: true,
      notes: "Queue for cheque book collection. Ask for manager if queue exceeds 1hr.",
      rated: true, rating: 5, review: "Chilufya was incredibly efficient!",
    },
    {
      id: "b2", userId: "u1", service: "Pharmacy Pickup", location: "Solwezi General Hospital Pharmacy",
      date: "2026-04-09", time: "11:00", status: "in_progress",
      agentId: "a2", price: 60, paid: false,
      notes: "Collect prescription under name Mutembo. Ref: RX-2024-0091",
      rated: false,
    },
    {
      id: "b3", userId: "u1", service: "Office Runs", location: "ZRA Solwezi Office",
      date: "2026-04-10", time: "08:30", status: "assigned",
      agentId: "a1", price: 120, paid: false,
      notes: "Submit ITF1 form. Documents are in the brown envelope.",
      rated: false,
    },
    {
      id: "b4", userId: "u1", service: "Grocery Shopping", location: "Shoprite Solwezi",
      date: "2026-04-12", time: "10:00", status: "pending",
      agentId: null, price: 95, paid: false,
      notes: "Shopping list attached. Budget: ZMW 500. Change to be returned.",
      rated: false,
    },
  ],
  users: [
    { id: "u1", name: "Mutembo Chisanga", phone: "0977 000 001", role: "customer", verified: true, avatar: "MC", color: "#0891b2" },
    { id: "u2", name: "Alice Musonda", phone: "0966 000 002", role: "customer", verified: true, avatar: "AM", color: "#7c3aed" },
  ],
};

const SERVICES = [
  { id: "queueing", label: "Queueing", icon: "🏦", desc: "Banks, clinics, utilities", base: 60 },
  { id: "shopping", label: "Shopping", icon: "🛒", desc: "Groceries, store items", base: 80 },
  { id: "office", label: "Office Runs", icon: "🏛️", desc: "ZRA, PACRA, Council", base: 120 },
  { id: "pharmacy", label: "Pharmacy", icon: "💊", desc: "Medication pickups", base: 55 },
  { id: "utility", label: "Utility Payments", icon: "⚡", desc: "ZESCO, DSTV, Water", base: 45 },
  { id: "parcel", label: "Parcel Delivery", icon: "📦", desc: "Door-to-door delivery", base: 70 },
];

const statusConfig = {
  pending:     { label: "Pending",     color: T.warning,  bg: "#fef3c7", icon: "⏳" },
  assigned:    { label: "Assigned",    color: T.primary,  bg: "#dbeafe", icon: "👤" },
  in_progress: { label: "In Progress", color: T.accent,   bg: "#e0f2fe", icon: "🏃" },
  completed:   { label: "Completed",   color: T.success,  bg: "#dcfce7", icon: "✅" },
  approved:    { label: "Approved",    color: T.success,  bg: "#dcfce7", icon: "✅" },
  pending_v:   { label: "Pending",     color: T.warning,  bg: "#fef3c7", icon: "⏳" },
  rejected:    { label: "Rejected",    color: T.danger,   bg: "#fee2e2", icon: "❌" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Avatar = ({ initials, color, size = 40, style = {} }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: size * 0.35,
    fontFamily: "'DM Sans', sans-serif", flexShrink: 0, ...style
  }}>{initials}</div>
);

const Badge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`,
      borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: 0.3, display: "inline-flex", alignItems: "center", gap: 4,
    }}>{cfg.icon} {cfg.label}</span>
  );
};

const Stars = ({ rating, size = 14 }) => (
  <span style={{ fontSize: size }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#cbd5e1" }}>★</span>
    ))}
  </span>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: T.surface, borderRadius: 16, padding: "16px",
    boxShadow: "0 2px 12px rgba(37,99,235,0.08)", border: `1px solid ${T.border}`,
    backdropFilter: "blur(8px)", cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s", ...style
  }}
  onMouseEnter={e => { if(onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.15)"; }}}
  onMouseLeave={e => { if(onClick) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(37,99,235,0.08)"; }}}
  >{children}</div>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled = false }) => {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff", border: "none" },
    secondary: { background: "transparent", color: T.primary, border: `1.5px solid ${T.primary}` },
    danger: { background: T.danger, color: "#fff", border: "none" },
    success: { background: T.success, color: "#fff", border: "none" },
    ghost: { background: "rgba(37,99,235,0.06)", color: T.primary, border: "none" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      ...styles[variant], borderRadius: 12, padding: "10px 20px",
      fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, transition: "all 0.2s",
      fontFamily: "'DM Sans', sans-serif", ...style,
    }}
    onMouseEnter={e => { if(!disabled) e.currentTarget.style.opacity = "0.85"; }}
    onMouseLeave={e => { if(!disabled) e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, style = {} }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 5, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14, color: T.dark,
        border: `1.5px solid ${T.border}`, background: "rgba(255,255,255,0.8)",
        fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
        outline: "none", transition: "border 0.2s", ...style
      }}
      onFocus={e => e.target.style.borderColor = T.primary}
      onBlur={e => e.target.style.borderColor = T.border}
    />
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20, padding: 24, maxWidth: 440, width: "100%",
        maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(37,99,235,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: T.dark, fontFamily: "'DM Sans', sans-serif" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null); // null = login screen
  const [screen, setScreen] = useState("home");
  const [bookings, setBookings] = useState(SEED.bookings);
  const [agents, setAgents] = useState(SEED.agents);
  const [users] = useState(SEED.users);
  const [notification, setNotification] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [newBooking, setNewBooking] = useState(null);
  const [adminTab, setAdminTab] = useState("overview");
  const [agentTab, setAgentTab] = useState("jobs");

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3200);
  };

  const currentUser = SEED.users[0];

  // ─── BOOKING ACTIONS ───────────────────────────────────────────────────────
  const createBooking = (data) => {
    const nb = {
      id: `b${Date.now()}`, userId: "u1", ...data,
      status: "pending", agentId: null, paid: false, rated: false,
    };
    setBookings(prev => [nb, ...prev]);
    setNewBooking(null);
    setScreen("bookings");
    notify("Booking confirmed! An agent will be assigned shortly. 🎉");
  };

  const agentAcceptJob = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "in_progress", agentId: "a1" } : b));
    notify("Job accepted! Navigate to customer location.");
  };

  const agentCompleteJob = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "completed" } : b));
    notify("Job marked as completed! ✅");
  };

  const submitRating = (bookingId, agentId, rating, review) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, rated: true, rating, review } : b));
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      const newAvg = ((a.rating * a.jobs) + rating) / (a.jobs + 1);
      return { ...a, rating: Math.round(newAvg * 10) / 10 };
    }));
    setRatingModal(null);
    notify("Rating submitted! Thank you for your feedback. ⭐");
  };

  const adminAction = (agentId, action) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: action === "approve" ? "approved" : "rejected" } : a));
    notify(action === "approve" ? "Agent approved ✅" : "Agent rejected ❌", action === "approve" ? "success" : "danger");
  };

  // ─── LAYOUT ────────────────────────────────────────────────────────────────
  if (!role) return <LoginScreen onLogin={setRole} />;

  return (
    <div style={{
      minHeight: "100vh", background: T.background, fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto",
      boxShadow: "0 0 60px rgba(37,99,235,0.12)", position: "relative",
    }}>
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          background: notification.type === "danger" ? T.danger : T.dark,
          color: "#fff", borderRadius: 14, padding: "12px 20px", zIndex: 9999,
          fontSize: 13, fontWeight: 600, maxWidth: 380, textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "slideDown 0.3s ease",
        }}>{notification.msg}</div>
      )}

      {/* HEADER */}
      <Header role={role} screen={screen} setScreen={setScreen} setRole={setRole} />

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        {role === "customer" && (
          <>
            {screen === "home" && <CustomerHome setScreen={setScreen} setNewBooking={setNewBooking} />}
            {screen === "bookings" && (
              <CustomerBookings bookings={bookings} agents={agents}
                onSelect={b => setSelectedBooking(b)} onRate={b => setRatingModal(b)} />
            )}
            {screen === "profile" && <CustomerProfile user={currentUser} bookings={bookings} />}
            {screen === "agent-profile" && selectedAgent && (
              <AgentProfileView agent={selectedAgent} onBack={() => { setScreen("bookings"); setSelectedAgent(null); }} />
            )}
            {screen === "booking-detail" && selectedBooking && (
              <BookingDetail booking={selectedBooking} agents={agents}
                onBack={() => { setScreen("bookings"); setSelectedBooking(null); }}
                onRate={() => setRatingModal(selectedBooking)}
                onViewAgent={aid => { setSelectedAgent(agents.find(a => a.id === aid)); setScreen("agent-profile"); }}
              />
            )}
            {screen === "new-booking" && (
              <NewBooking service={newBooking} onConfirm={createBooking} onBack={() => setScreen("home")} />
            )}
          </>
        )}

        {role === "agent" && (
          <>
            {screen === "home" && (
              <AgentDashboard bookings={bookings} tab={agentTab} setTab={setAgentTab}
                onAccept={agentAcceptJob} onComplete={agentCompleteJob} notify={notify} />
            )}
            {screen === "profile" && <AgentSelfProfile agent={agents[0]} />}
          </>
        )}

        {role === "admin" && (
          <AdminDashboard agents={agents} users={users} bookings={bookings}
            tab={adminTab} setTab={setAdminTab} onAgentAction={adminAction} notify={notify} />
        )}
      </div>

      {/* BOTTOM NAV */}
      <BottomNav role={role} screen={screen} setScreen={setScreen} />

      {/* RATING MODAL */}
      {ratingModal && (
        <RatingModal booking={ratingModal} agents={agents}
          onSubmit={submitRating} onClose={() => setRatingModal(null)} />
      )}

      {/* BOOKING DETAIL MODAL TRIGGER */}
      {selectedBooking && screen === "bookings" && (
        <div style={{ display: "none" }} ref={() => setScreen("booking-detail")} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease forwards; }
      `}</style>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);

  const roles = [
    { id: "customer", icon: "👤", label: "Customer", desc: "Book errands & appointments", color: T.primary },
    { id: "agent", icon: "🏃", label: "Agent / Runner", desc: "Accept & complete jobs", color: T.accent },
    { id: "admin", icon: "🛡️", label: "Admin", desc: "Manage platform operations", color: "#7c3aed" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(160deg, ${T.dark} 0%, rgb(15,40,90) 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 28, fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* LOGO */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 14px",
          background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, boxShadow: `0 12px 32px rgba(37,99,235,0.4)`,
        }}>⚡</div>
        <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>QuickErrands</div>
        <div style={{ color: T.secondary, fontSize: 14, fontWeight: 500, marginTop: 3 }}>Zambia · On-Demand Errand Platform</div>
      </div>

      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Select your role to continue</div>

      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 12 }}>
        {roles.map(r => (
          <div key={r.id} onClick={() => setSelected(r.id)} style={{
            background: selected === r.id ? `linear-gradient(135deg, ${r.color}22, ${r.color}11)` : "rgba(255,255,255,0.05)",
            border: `1.5px solid ${selected === r.id ? r.color : "rgba(255,255,255,0.1)"}`,
            borderRadius: 16, padding: "16px 18px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 28, width: 44, height: 44, background: `${r.color}22`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.icon}</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{r.label}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{r.desc}</div>
            </div>
            {selected === r.id && <div style={{ marginLeft: "auto", color: r.color, fontSize: 20 }}>✓</div>}
          </div>
        ))}
      </div>

      <Btn onClick={() => selected && onLogin(selected)}
        style={{ marginTop: 24, width: "100%", maxWidth: 380, padding: "14px", fontSize: 16, borderRadius: 14 }}>
        Enter Platform →
      </Btn>

      <div style={{ marginTop: 20, color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center" }}>
        Demo · All data is simulated · No real transactions
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ role, screen, setScreen, setRole }) {
  const titles = {
    home: role === "admin" ? "Admin Dashboard" : role === "agent" ? "Agent Hub" : "QuickErrands",
    bookings: "My Bookings",
    profile: "My Profile",
    "new-booking": "New Booking",
    "agent-profile": "Agent Profile",
    "booking-detail": "Booking Details",
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${T.dark}, rgb(15,40,90))`,
      padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 4px 20px rgba(15,23,42,0.3)", position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>⚡</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>{titles[screen] || "QuickErrands"}</div>
          <div style={{ color: T.secondary, fontSize: 10, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {role === "customer" ? "Solwezi, NW Province" : role === "agent" ? "Agent Mode" : "Admin Control"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{
          background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px",
          color: T.secondary, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
        }}>{role}</div>
        <button onClick={() => setRole(null)} style={{
          background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: 8,
          padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600,
        }}>↩</button>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ role, screen, setScreen }) {
  const customerTabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "bookings", icon: "📋", label: "Bookings" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  const agentTabs = [
    { id: "home", icon: "💼", label: "Jobs" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  const tabs = role === "agent" ? agentTabs : role === "admin" ? [] : customerTabs;
  if (!tabs.length) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, background: T.dark, display: "flex",
      borderTop: `1px solid rgba(255,255,255,0.08)`, zIndex: 200,
    }}>
      {tabs.map(t => {
        const active = screen === t.id;
        return (
          <button key={t.id} onClick={() => setScreen(t.id)} style={{
            flex: 1, background: "none", border: "none", padding: "10px 0 8px",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            borderTop: active ? `2px solid ${T.accent}` : "2px solid transparent",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ color: active ? T.accent : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 0.3 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── CUSTOMER HOME ────────────────────────────────────────────────────────────
function CustomerHome({ setScreen, setNewBooking }) {
  return (
    <div className="fade-in" style={{ padding: 20 }}>
      {/* HERO */}
      <div style={{
        background: `linear-gradient(135deg, ${T.dark} 0%, rgb(15,55,110) 100%)`,
        borderRadius: 20, padding: "22px 20px", marginBottom: 24, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, fontSize: 90, opacity: 0.08 }}>⚡</div>
        <div style={{ color: T.secondary, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Welcome back 👋</div>
        <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Mutembo Chisanga</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>What errand can we run for you today?</div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>4</div>
            <div style={{ color: T.secondary, fontSize: 10, fontWeight: 600 }}>BOOKINGS</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>1</div>
            <div style={{ color: T.secondary, fontSize: 10, fontWeight: 600 }}>ACTIVE</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>⭐ 4.9</div>
            <div style={{ color: T.secondary, fontSize: 10, fontWeight: 600 }}>AVG RATING</div>
          </div>
        </div>
      </div>

      {/* SERVICE CATEGORIES */}
      <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 14 }}>Select a Service</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {SERVICES.map(s => (
          <Card key={s.id} onClick={() => { setNewBooking(s); setScreen("new-booking"); }}
            style={{ textAlign: "center", padding: "18px 12px" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.dark }}>{s.label}</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{s.desc}</div>
            <div style={{ marginTop: 8, background: T.background, borderRadius: 8, padding: "4px 8px", display: "inline-block" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>from ZMW {s.base}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* QUICK STATS */}
      <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 14 }}>How It Works</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { step: "01", title: "Choose a Service", desc: "Select from 6 service categories" },
          { step: "02", title: "Book & Schedule", desc: "Pick date, time & add instructions" },
          { step: "03", title: "Agent Assigned", desc: "Verified runner handles your errand" },
        ].map(item => (
          <Card key={item.step} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 13,
            }}>{item.step}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.dark }}>{item.title}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{item.desc}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── NEW BOOKING ──────────────────────────────────────────────────────────────
function NewBooking({ service, onConfirm, onBack }) {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const distance = Math.floor(Math.random() * 8) + 2;
  const price = service ? service.base + distance * 5 : 0;

  const canStep2 = location.trim().length > 2;
  const canConfirm = date && time;

  return (
    <div className="fade-in" style={{ padding: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.primary, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back
      </button>

      {/* SERVICE BANNER */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${T.dark}, rgb(15,55,110))` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 40 }}>{service?.icon}</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{service?.label}</div>
            <div style={{ color: T.secondary, fontSize: 13 }}>{service?.desc}</div>
          </div>
        </div>
      </Card>

      {/* STEP INDICATOR */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, alignItems: "center" }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: step >= s ? T.primary : T.border, color: step >= s ? "#fff" : T.muted, fontWeight: 800, fontSize: 12,
            }}>{step > s ? "✓" : s}</div>
            {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? T.primary : T.border, width: 40 }} />}
          </div>
        ))}
        <div style={{ fontSize: 12, color: T.muted, marginLeft: 4, fontWeight: 600 }}>
          {step === 1 ? "Location" : step === 2 ? "Schedule" : "Confirm"}
        </div>
      </div>

      {step === 1 && (
        <div className="fade-in">
          <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 4 }}>Where should we go?</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>Enter the specific location for this errand</div>
          <Input label="Pickup / Errand Location" value={location} onChange={setLocation}
            placeholder="e.g. Solwezi FNB Branch, Main Street" />
          <Input label="Additional Notes / Instructions" value={notes} onChange={setNotes}
            placeholder="e.g. Ask for Manager John, counter 3..." />
          <Btn onClick={() => setStep(2)} disabled={!canStep2} style={{ width: "100%", marginTop: 8 }}>
            Continue to Schedule →
          </Btn>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 4 }}>Pick a Date & Time</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>Schedule when you need this done</div>
          <Input label="Date" value={date} onChange={setDate} type="date" />
          <Input label="Time" value={time} onChange={setTime} type="time" />
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Btn>
            <Btn onClick={() => setStep(3)} disabled={!canConfirm} style={{ flex: 2 }}>Review Booking →</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in">
          <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 16 }}>Confirm Your Booking</div>
          <Card style={{ marginBottom: 16, background: T.background }}>
            {[
              ["Service", `${service?.icon} ${service?.label}`],
              ["Location", location],
              ["Date", date],
              ["Time", time],
              ["Notes", notes || "None"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>{k}</span>
                <span style={{ color: T.dark, fontSize: 13, fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card style={{ background: `linear-gradient(135deg, ${T.primary}11, ${T.accent}11)`, border: `1px solid ${T.primary}33`, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Price Estimate</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Base ZMW {service?.base} + ~{distance}km × 5</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: T.primary }}>ZMW {price}</div>
            </div>
          </Card>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← Edit</Btn>
            <Btn onClick={() => onConfirm({ service: service?.label, location, date, time, notes, price })} style={{ flex: 2 }}>
              ✅ Confirm Booking
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOMER BOOKINGS ────────────────────────────────────────────────────────
function CustomerBookings({ bookings, agents, onSelect, onRate }) {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "pending", "assigned", "in_progress", "completed"];
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="fade-in" style={{ padding: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: T.dark, marginBottom: 14 }}>My Bookings</div>
      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {filters.map(f => {
          const labels = { all: "All", pending: "Pending", assigned: "Assigned", in_progress: "In Progress", completed: "Done" };
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? T.primary : "rgba(37,99,235,0.08)",
              color: filter === f ? "#fff" : T.primary, border: "none", borderRadius: 20,
              padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}>{labels[f]}</button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <div style={{ fontWeight: 700 }}>No bookings found</div>
          </div>
        )}
        {filtered.map(b => {
          const agent = agents.find(a => a.id === b.agentId);
          const sc = statusConfig[b.status] || statusConfig.pending;
          return (
            <Card key={b.id} onClick={() => onSelect(b)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.dark }}>{b.service}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>📍 {b.location}</div>
                </div>
                <Badge status={b.status} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: T.muted }}>
                  <span>📅 {b.date}</span>
                  <span>🕐 {b.time}</span>
                </div>
                <div style={{ fontWeight: 800, color: T.primary, fontSize: 14 }}>ZMW {b.price}</div>
              </div>
              {agent && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar initials={agent.avatar} color={agent.color} size={28} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>{agent.name}</div>
                      <Stars rating={agent.rating} size={11} />
                    </div>
                  </div>
                  {b.status === "completed" && !b.rated && (
                    <Btn variant="ghost" onClick={e => { e.stopPropagation(); onRate(b); }} style={{ padding: "5px 12px", fontSize: 11 }}>
                      ⭐ Rate
                    </Btn>
                  )}
                  {b.rated && <span style={{ fontSize: 11, color: T.success, fontWeight: 700 }}>✅ Rated</span>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── BOOKING DETAIL ───────────────────────────────────────────────────────────
function BookingDetail({ booking, agents, onBack, onRate, onViewAgent }) {
  const agent = agents.find(a => a.id === booking.agentId);
  const sc = statusConfig[booking.status];

  return (
    <div className="fade-in" style={{ padding: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.primary, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
        ← Back to Bookings
      </button>

      <div style={{ fontWeight: 800, fontSize: 20, color: T.dark, marginBottom: 4 }}>{booking.service}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center" }}>
        <Badge status={booking.status} />
        <span style={{ fontSize: 12, color: T.muted }}>ID: {booking.id}</span>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Booking Details</div>
        {[
          ["📍 Location", booking.location],
          ["📅 Date", booking.date],
          ["🕐 Time", booking.time],
          ["📝 Notes", booking.notes || "None"],
          ["💰 Price", `ZMW ${booking.price}`],
          ["💳 Payment", booking.paid ? "✅ Paid" : "⏳ Unpaid"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ color: T.muted, fontSize: 13 }}>{k}</span>
            <span style={{ color: T.dark, fontSize: 13, fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}
      </Card>

      {agent ? (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Assigned Agent</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <Avatar initials={agent.avatar} color={agent.color} size={52} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.dark }}>{agent.name}</div>
              <Stars rating={agent.rating} />
              <div style={{ fontSize: 12, color: T.muted }}>{agent.rating} · {agent.jobs} jobs</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: T.dark, background: T.background, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
            {agent.bio}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => onViewAgent(agent.id)} style={{ flex: 1, fontSize: 13 }}>View Full Profile</Btn>
            <Btn variant="ghost" style={{ flex: 1, fontSize: 13 }}>📞 {agent.phone}</Btn>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 14, textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <div style={{ fontWeight: 700, color: T.dark }}>Finding an Agent...</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>We're matching you with a verified runner</div>
        </Card>
      )}

      {booking.status === "completed" && !booking.rated && (
        <Btn onClick={onRate} style={{ width: "100%" }}>⭐ Rate Your Agent</Btn>
      )}
      {booking.rated && (
        <Card style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div style={{ fontWeight: 700, color: T.success, marginBottom: 4 }}>✅ You rated this job</div>
          <Stars rating={booking.rating} />
          {booking.review && <div style={{ fontSize: 13, color: T.dark, marginTop: 6 }}>"{booking.review}"</div>}
        </Card>
      )}
    </div>
  );
}

// ─── AGENT PROFILE VIEW (Customer-facing) ────────────────────────────────────
function AgentProfileView({ agent, onBack }) {
  return (
    <div className="fade-in" style={{ padding: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.primary, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
        ← Back
      </button>

      {/* HERO */}
      <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${T.dark}, rgb(15,55,110))`, textAlign: "center", padding: "28px 20px" }}>
        <Avatar initials={agent.avatar} color={agent.color} size={72} style={{ margin: "0 auto 12px" }} />
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{agent.name}</div>
        <div style={{ color: T.secondary, fontSize: 13, marginTop: 4 }}>{agent.phone}</div>
        <div style={{ marginTop: 8 }}><Stars rating={agent.rating} size={18} /></div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>{agent.rating} avg · {agent.jobs} completed jobs</div>
      </Card>

      {/* BIO */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>About</div>
        <div style={{ fontSize: 14, color: T.dark, lineHeight: 1.6 }}>{agent.bio}</div>
      </Card>

      {/* SKILLS */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {agent.skills.map(s => (
            <span key={s} style={{ background: `${T.primary}15`, color: T.primary, border: `1px solid ${T.primary}33`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{s}</span>
          ))}
        </div>
      </Card>

      {/* EXPERIENCE & AREAS */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Experience</div>
        <div style={{ fontSize: 14, color: T.dark }}>{agent.experience}</div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Areas of Operation</div>
        {agent.areas.map(a => (
          <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span style={{ fontSize: 14, color: T.dark }}>{a}</span>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Availability</div>
        <div style={{ fontSize: 14, color: T.dark }}>🕐 {agent.availability}</div>
      </Card>
    </div>
  );
}

// ─── CUSTOMER PROFILE ─────────────────────────────────────────────────────────
function CustomerProfile({ user, bookings }) {
  const completed = bookings.filter(b => b.status === "completed").length;
  const spent = bookings.filter(b => b.paid).reduce((s, b) => s + b.price, 0);

  return (
    <div className="fade-in" style={{ padding: 20 }}>
      <Card style={{ background: `linear-gradient(135deg, ${T.dark}, rgb(15,55,110))`, marginBottom: 16, textAlign: "center", padding: "28px 20px" }}>
        <Avatar initials={user.avatar} color={user.color} size={68} style={{ margin: "0 auto 12px" }} />
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{user.name}</div>
        <div style={{ color: T.secondary, fontSize: 13, marginTop: 4 }}>{user.phone}</div>
        <div style={{ display: "inline-flex", background: "rgba(22,163,74,0.2)", borderRadius: 8, padding: "4px 12px", marginTop: 8 }}>
          <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>✓ Verified Customer</span>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Bookings", value: bookings.length },
          { label: "Completed", value: completed },
          { label: "ZMW Spent", value: spent },
        ].map(item => (
          <Card key={item.label} style={{ textAlign: "center", padding: "14px 8px" }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: T.primary }}>{item.value}</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{item.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Account Details</div>
        {[
          ["Full Name", user.name],
          ["Phone", user.phone],
          ["Role", "Customer"],
          ["NRC", "•••••/••/•"],
          ["Status", "✅ Verified"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ color: T.muted, fontSize: 13 }}>{k}</span>
            <span style={{ color: T.dark, fontSize: 13, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── AGENT DASHBOARD ──────────────────────────────────────────────────────────
function AgentDashboard({ bookings, tab, setTab, onAccept, onComplete, notify }) {
  const myAgent = { id: "a1" };
  const pendingJobs = bookings.filter(b => b.status === "pending" && !b.agentId);
  const myJobs = bookings.filter(b => b.agentId === myAgent.id);
  const activeJob = myJobs.find(b => b.status === "in_progress");

  return (
    <div className="fade-in" style={{ padding: 20 }}>
      {/* ACTIVE JOB BANNER */}
      {activeJob && (
        <div style={{
          background: `linear-gradient(135deg, ${T.accent}, ${T.primary})`,
          borderRadius: 16, padding: "16px 18px", marginBottom: 16, color: "#fff",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.8, textTransform: "uppercase", marginBottom: 4 }}>🏃 Active Job</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{activeJob.service}</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>📍 {activeJob.location}</div>
          <Btn onClick={() => onComplete(activeJob.id)} variant="secondary"
            style={{ marginTop: 12, background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", fontSize: 13 }}>
            ✅ Mark as Completed
          </Btn>
        </div>
      )}

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Jobs Done", value: 142, icon: "✅" },
          { label: "Rating", value: "4.8⭐", icon: "⭐" },
          { label: "Pending", value: pendingJobs.length, icon: "⏳" },
        ].map(item => (
          <Card key={item.label} style={{ textAlign: "center", padding: "14px 8px" }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: T.primary }}>{item.value}</div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{item.label}</div>
          </Card>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", background: "rgba(37,99,235,0.08)", borderRadius: 12, padding: 4, marginBottom: 16 }}>
        {[["jobs", "Available Jobs"], ["mine", "My Jobs"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, background: tab === id ? T.primary : "transparent",
            color: tab === id ? "#fff" : T.primary, border: "none", borderRadius: 9,
            padding: "9px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>{label}</button>
        ))}
      </div>

      {tab === "jobs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendingJobs.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: T.muted }}>
              <div style={{ fontSize: 36 }}>🎉</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>No pending jobs right now</div>
            </div>
          )}
          {pendingJobs.map(b => (
            <Card key={b.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.dark }}>{b.service}</div>
                <div style={{ fontWeight: 800, color: T.primary }}>ZMW {b.price}</div>
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>📍 {b.location}</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>📅 {b.date} · 🕐 {b.time}</div>
              {b.notes && <div style={{ fontSize: 12, background: T.background, borderRadius: 8, padding: "8px 10px", marginBottom: 12, color: T.dark }}>📝 {b.notes}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => notify("Job declined", "danger")}>Decline</Btn>
                <Btn style={{ flex: 2, fontSize: 13 }} onClick={() => onAccept(b.id)}>✅ Accept Job</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "mine" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {myJobs.map(b => (
            <Card key={b.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: T.dark }}>{b.service}</div>
                <Badge status={b.status} />
              </div>
              <div style={{ fontSize: 13, color: T.muted }}>📍 {b.location}</div>
              <div style={{ fontSize: 13, color: T.muted }}>📅 {b.date} · ZMW {b.price}</div>
              {b.rated && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: "#f0fdf4", borderRadius: 8, fontSize: 12, color: T.success }}>
                  ⭐ Customer rated: {b.rating}/5 {b.review ? `— "${b.review}"` : ""}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AGENT SELF PROFILE ───────────────────────────────────────────────────────
function AgentSelfProfile({ agent }) {
  return (
    <div className="fade-in" style={{ padding: 20 }}>
      <Card style={{ background: `linear-gradient(135deg, ${T.dark}, rgb(15,55,110))`, marginBottom: 16, textAlign: "center", padding: "28px 20px" }}>
        <Avatar initials={agent.avatar} color={agent.color} size={68} style={{ margin: "0 auto 12px" }} />
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{agent.name}</div>
        <div style={{ color: T.secondary, fontSize: 13, marginTop: 4 }}>{agent.phone}</div>
        <Badge status={agent.status} />
        <div style={{ marginTop: 8 }}><Stars rating={agent.rating} size={16} /></div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Identity Verification</div>
        {[
          ["NRC Number", "123456/78/1"],
          ["NRC Image", "✅ Uploaded"],
          ["Profile Image", "✅ Uploaded"],
          ["Next of Kin", "+260 977 000 999"],
          ["Phone Verified", "✅ Verified"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ color: T.muted, fontSize: 13 }}>{k}</span>
            <span style={{ color: T.dark, fontSize: 13, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Bio</div>
        <div style={{ fontSize: 14, color: T.dark, lineHeight: 1.6 }}>{agent.bio}</div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>My Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {agent.skills.map(s => (
            <span key={s} style={{ background: `${T.primary}15`, color: T.primary, border: `1px solid ${T.primary}33`, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{s}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ agents, users, bookings, tab, setTab, onAgentAction, notify }) {
  const pending = agents.filter(a => a.status === "pending");
  const approved = agents.filter(a => a.status === "approved");

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "agents", label: "Agents", icon: "🧑‍🔧" },
    { id: "bookings", label: "Bookings", icon: "📋" },
    { id: "users", label: "Users", icon: "👥" },
  ];

  return (
    <div className="fade-in" style={{ padding: 20 }}>
      {/* ADMIN HEADER */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? T.primary : "rgba(37,99,235,0.08)",
            color: tab === t.id ? "#fff" : T.primary, border: "none", borderRadius: 10,
            padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total Users", value: users.length, icon: "👤", color: T.primary },
              { label: "Total Agents", value: agents.length, icon: "🏃", color: T.accent },
              { label: "Total Bookings", value: bookings.length, icon: "📋", color: T.success },
              { label: "Pending Verify", value: pending.length, icon: "⏳", color: T.warning },
            ].map(item => (
              <Card key={item.label} style={{ textAlign: "center", padding: "18px 12px" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 24, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{item.label}</div>
              </Card>
            ))}
          </div>

          {pending.length > 0 && (
            <Card style={{ background: "#fef9c3", border: "1px solid #fde68a" }}>
              <div style={{ fontWeight: 700, color: "#92400e", fontSize: 14, marginBottom: 10 }}>⚠️ {pending.length} Agent(s) Awaiting Verification</div>
              {pending.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid #fde68a` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={a.avatar} color={a.color} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.dark }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{a.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="success" onClick={() => onAgentAction(a.id, "approve")} style={{ padding: "5px 10px", fontSize: 11 }}>✅</Btn>
                    <Btn variant="danger" onClick={() => onAgentAction(a.id, "reject")} style={{ padding: "5px 10px", fontSize: 11 }}>❌</Btn>
                  </div>
                </div>
              ))}
            </Card>
          )}

          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 10 }}>Recent Bookings</div>
            {bookings.slice(0, 3).map(b => (
              <Card key={b.id} style={{ marginBottom: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{b.service}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>📍 {b.location}</div>
                  </div>
                  <Badge status={b.status} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "agents" && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 14 }}>All Agents ({agents.length})</div>
          {agents.map(a => (
            <Card key={a.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <Avatar initials={a.avatar} color={a.color} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.dark }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{a.phone}</div>
                </div>
                <Badge status={a.status} />
              </div>
              {/* SECURE FIELDS (Admin Only) */}
              <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>🔒 Secure Data (Admin Only)</div>
                <div style={{ fontSize: 12, color: "#78350f" }}>NRC: {a.nrc}</div>
                <div style={{ fontSize: 12, color: "#78350f" }}>NRC Image: ✅ Uploaded & Encrypted</div>
                <div style={{ fontSize: 12, color: "#78350f" }}>Next of Kin: +260 977 XXX XXX</div>
              </div>
              {a.skills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {a.skills.map(s => (
                    <span key={s} style={{ background: `${T.primary}15`, color: T.primary, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              )}
              {a.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="success" onClick={() => onAgentAction(a.id, "approve")} style={{ flex: 1, fontSize: 13 }}>✅ Approve</Btn>
                  <Btn variant="danger" onClick={() => onAgentAction(a.id, "reject")} style={{ flex: 1, fontSize: 13 }}>❌ Reject</Btn>
                </div>
              )}
              {a.status === "approved" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ fontSize: 12, color: T.success, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    ✅ Approved · {a.jobs} jobs · ⭐ {a.rating}
                  </div>
                  <Btn variant="danger" onClick={() => notify("Account suspended", "danger")} style={{ marginLeft: "auto", padding: "5px 10px", fontSize: 11 }}>Suspend</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "bookings" && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 14 }}>All Bookings ({bookings.length})</div>
          {bookings.map(b => (
            <Card key={b.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{b.service}</div>
                <Badge status={b.status} />
              </div>
              <div style={{ fontSize: 13, color: T.muted }}>📍 {b.location}</div>
              <div style={{ fontSize: 13, color: T.muted }}>📅 {b.date} · 🕐 {b.time}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 12, color: T.muted }}>Customer: User #{b.userId} · Agent: {b.agentId || "Unassigned"}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.paid ? T.success : T.warning }}>{b.paid ? "✅ Paid" : "⏳ Unpaid"}</span>
              </div>
              {!b.agentId && (
                <Btn style={{ width: "100%", marginTop: 8, fontSize: 12, padding: "8px" }} onClick={() => notify("Agent manually assigned: Chilufya Banda ✅")}>
                  ➕ Manually Assign Agent
                </Btn>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: T.dark, marginBottom: 14 }}>All Users ({users.length})</div>
          {users.map(u => (
            <Card key={u.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={u.avatar} color={u.color} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.dark }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{u.phone} · {u.role}</div>
                </div>
                {u.verified ? (
                  <span style={{ fontSize: 11, color: T.success, fontWeight: 700 }}>✅ Verified</span>
                ) : (
                  <span style={{ fontSize: 11, color: T.warning, fontWeight: 700 }}>⏳ Pending</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Btn variant="ghost" style={{ flex: 1, fontSize: 11, padding: "6px" }} onClick={() => notify("Viewing user details...")}>View Details</Btn>
                <Btn variant="danger" style={{ flex: 1, fontSize: 11, padding: "6px" }} onClick={() => notify("Account flagged ⚠️", "danger")}>Flag Account</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── RATING MODAL ─────────────────────────────────────────────────────────────
function RatingModal({ booking, agents, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const agent = agents.find(a => a.id === booking.agentId);

  return (
    <Modal open={true} onClose={onClose} title="Rate Your Agent">
      {agent && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px", background: T.background, borderRadius: 12 }}>
          <Avatar initials={agent.avatar} color={agent.color} size={44} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{agent.name}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{booking.service}</div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 600, marginBottom: 10 }}>How was your experience?</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
              style={{
                background: "none", border: "none", fontSize: 36, cursor: "pointer",
                color: s <= (hover || rating) ? "#f59e0b" : "#e2e8f0",
                transition: "color 0.1s", transform: s <= (hover || rating) ? "scale(1.1)" : "scale(1)",
              }}>★</button>
          ))}
        </div>
        {rating > 0 && (
          <div style={{ color: T.primary, fontWeight: 700, fontSize: 14, marginTop: 6 }}>
            {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
          </div>
        )}
      </div>

      <Input label="Leave a review (optional)" value={review} onChange={setReview}
        placeholder="Great service, very punctual..." />

      <Btn onClick={() => agent && onSubmit(booking.id, agent.id, rating, review)}
        disabled={rating === 0} style={{ width: "100%" }}>
        Submit Rating ⭐
      </Btn>
    </Modal>
  );
}