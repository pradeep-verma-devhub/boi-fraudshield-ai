const BASE_URL = "http://localhost:3000";

// ─── Dummy Data ──────────────────────────────────────────
const DUMMY = {
  home: {
    title: "AI Fraud Detection System",
    description:
      "Advanced machine-learning powered banking security that monitors transactions in real-time, detects anomalies, and protects your finances 24/7.",
    features: [
      {
        icon: "🧠",
        name: "Behaviour Analysis",
        detail:
          "Deep-learning models analyse spending patterns, login locations and device fingerprints to build a unique behavioural profile for every user.",
      },
      {
        icon: "📊",
        name: "Risk Scoring",
        detail:
          "Each transaction receives a real-time risk score from 0–100. Scores above 70 trigger additional verification steps automatically.",
      },
      {
        icon: "🔐",
        name: "OTP Security",
        detail:
          "Suspicious transactions require a one-time password sent to the registered device, adding an extra layer of protection.",
      },
    ],
    announcements: [
      "System maintenance scheduled for June 20, 2026 – 02:00 to 04:00 UTC.",
      "New AI model v3.2 deployed — 18% improvement in fraud detection accuracy.",
      "Two-factor authentication is now mandatory for all admin accounts.",
    ],
  },

  userDashboard: {
    riskScore: 72,
    balance: 5000,
    insights: [
      "Unusual night transaction detected at 02:14 AM",
      "Multiple logins from different cities within 1 hour",
      "High-value transfer to a new beneficiary",
    ],
    aiExplanation:
      "Your risk score increased due to a late-night transaction of ₹12,000 from an unrecognised device in a new geographic location. The AI model flagged the combination of time, amount and device as anomalous.",
    transactions: [
      { id: "TXN001", to: "Alice", amount: 1200, date: "2026-06-13", status: "LOW", riskScore: 22 },
      { id: "TXN002", to: "Bob", amount: 8500, date: "2026-06-12", status: "HIGH", riskScore: 81 },
      { id: "TXN003", to: "Charlie", amount: 300, date: "2026-06-11", status: "LOW", riskScore: 15 },
      { id: "TXN004", to: "Diana", amount: 15000, date: "2026-06-10", status: "HIGH", riskScore: 78 },
      { id: "TXN005", to: "Eve", amount: 450, date: "2026-06-09", status: "LOW", riskScore: 10 },
    ],
  },

  adminDashboard: {
    users: 120,
    fraud: 15,
    highRisk: 7,
    transactions: [
      { id: "TXN001", from: "John", to: "Alice", amount: 1200, date: "2026-06-13", status: "LOW", riskScore: 22 },
      { id: "TXN002", from: "Mike", to: "Bob", amount: 8500, date: "2026-06-12", status: "HIGH", riskScore: 81 },
      { id: "TXN003", from: "Sara", to: "Charlie", amount: 300, date: "2026-06-11", status: "LOW", riskScore: 15 },
      { id: "TXN004", from: "Tom", to: "Diana", amount: 15000, date: "2026-06-10", status: "HIGH", riskScore: 78 },
      { id: "TXN005", from: "Jane", to: "Eve", amount: 450, date: "2026-06-09", status: "LOW", riskScore: 10 },
      { id: "TXN006", from: "Paul", to: "Frank", amount: 22000, date: "2026-06-08", status: "HIGH", riskScore: 91 },
    ],
    highRiskUsers: [
      { name: "Mike", email: "mike@example.com", riskScore: 81 },
      { name: "Tom", email: "tom@example.com", riskScore: 78 },
      { name: "Paul", email: "paul@example.com", riskScore: 91 },
    ],
  },

  users: [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
    { id: 3, name: "Charlie", email: "charlie@example.com" },
    { id: 4, name: "Diana", email: "diana@example.com" },
    { id: 5, name: "Eve", email: "eve@example.com" },
  ],

  profile: {
    name: "John Doe",
    email: "john@example.com",
    balance: 5000,
    role: "user",
  },
};

// ─── HTTP Helpers ────────────────────────────────────────
async function get(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch {
    return null;
  }
}

async function post(path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────
export async function fetchHome() {
  return (await get("/api/home")) ?? DUMMY.home;
}

export async function login(email) {
  const data = await post("/api/auth/login", { email });
  return data ?? { role: email.includes("admin") ? "admin" : "user", email, name: email.split("@")[0] };
}

export async function fetchUserDashboard() {
  return (await get("/api/user/dashboard")) ?? DUMMY.userDashboard;
}

export async function fetchAdminDashboard() {
  return (await get("/api/admin/dashboard")) ?? DUMMY.adminDashboard;
}

export async function fetchUsers() {
  return (await get("/api/users")) ?? DUMMY.users;
}

export async function sendTransaction(payload) {
  const data = await post("/api/transaction", payload);
  return data ?? { riskScore: Math.floor(Math.random() * 100), status: Math.random() > 0.5 ? "HIGH" : "LOW", requiresOTP: Math.random() > 0.4 };
}

export async function sendOTP() {
  const data = await post("/api/otp/send", {});
  return data ?? { sent: true };
}

export async function verifyOTP(otp) {
  const data = await post("/api/otp/verify", { otp });
  return data ?? { verified: otp === "123456" };
}

export async function fetchProfile() {
  const data = await get("/api/user/profile");
  if (data) return data;
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  return { ...DUMMY.profile, ...stored };
}
