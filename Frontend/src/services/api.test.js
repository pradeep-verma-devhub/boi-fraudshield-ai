import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchHome,
  login,
  fetchUserDashboard,
  fetchAdminDashboard,
  fetchUsers,
  sendTransaction,
  sendOTP,
  verifyOTP,
  fetchProfile,
} from "./api";

// Helper to create a mock successful fetch response
function mockFetchSuccess(data) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

// Helper to create a mock failed fetch response (non-ok status)
function mockFetchFailure(statusText = "Internal Server Error") {
  return vi.fn().mockResolvedValue({
    ok: false,
    statusText,
  });
}

// Helper to create a fetch that rejects (network error)
function mockFetchNetworkError() {
  return vi.fn().mockRejectedValue(new Error("Network Error"));
}

beforeEach(() => {
  vi.stubGlobal("fetch", undefined);
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

// ── fetchHome ────────────────────────────────────────────────
describe("fetchHome", () => {
  it("returns server data when fetch succeeds", async () => {
    const serverData = { title: "Server Home", description: "desc", features: [], announcements: [] };
    vi.stubGlobal("fetch", mockFetchSuccess(serverData));

    const result = await fetchHome();
    expect(result).toEqual(serverData);
  });

  it("falls back to DUMMY data when server returns non-ok", async () => {
    vi.stubGlobal("fetch", mockFetchFailure());

    const result = await fetchHome();
    expect(result.title).toBe("AI Fraud Detection System");
    expect(result.features).toHaveLength(3);
    expect(result.announcements).toHaveLength(3);
  });

  it("falls back to DUMMY data on network error", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await fetchHome();
    expect(result.title).toBe("AI Fraud Detection System");
  });

  it("DUMMY home data contains expected feature names", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());
    const result = await fetchHome();
    const featureNames = result.features.map((f) => f.name);
    expect(featureNames).toContain("Behaviour Analysis");
    expect(featureNames).toContain("Risk Scoring");
    expect(featureNames).toContain("OTP Security");
  });
});

// ── login ────────────────────────────────────────────────────
describe("login", () => {
  it("returns server data when fetch succeeds", async () => {
    const serverData = { role: "user", email: "alice@example.com", name: "Alice" };
    vi.stubGlobal("fetch", mockFetchSuccess(serverData));

    const result = await login("alice@example.com");
    expect(result).toEqual(serverData);
  });

  it("falls back to admin role for admin email when server fails", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await login("superadmin@example.com");
    expect(result.role).toBe("admin");
    expect(result.email).toBe("superadmin@example.com");
  });

  it("falls back to user role for non-admin email when server fails", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await login("alice@example.com");
    expect(result.role).toBe("user");
    expect(result.email).toBe("alice@example.com");
  });

  it("extracts name from email when server fails", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await login("johndoe@test.com");
    expect(result.name).toBe("johndoe");
  });

  it("falls back to user role for non-ok server response", async () => {
    vi.stubGlobal("fetch", mockFetchFailure());

    const result = await login("user@example.com");
    expect(result.role).toBe("user");
  });

  it("admin keyword in email triggers admin role in fallback", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await login("admin@bank.com");
    expect(result.role).toBe("admin");
  });
});

// ── fetchUserDashboard ───────────────────────────────────────
describe("fetchUserDashboard", () => {
  it("returns server data when fetch succeeds", async () => {
    const serverData = { riskScore: 30, balance: 9000, insights: [], aiExplanation: "ok", transactions: [] };
    vi.stubGlobal("fetch", mockFetchSuccess(serverData));

    const result = await fetchUserDashboard();
    expect(result).toEqual(serverData);
  });

  it("falls back to DUMMY data on network error", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await fetchUserDashboard();
    expect(result.riskScore).toBe(72);
    expect(result.balance).toBe(5000);
    expect(result.insights).toHaveLength(3);
    expect(result.transactions).toHaveLength(5);
  });

  it("DUMMY dashboard data has riskScore >= 70 (triggers high-risk alert)", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());
    const result = await fetchUserDashboard();
    expect(result.riskScore).toBeGreaterThanOrEqual(70);
  });
});

// ── fetchAdminDashboard ──────────────────────────────────────
describe("fetchAdminDashboard", () => {
  it("returns server data when fetch succeeds", async () => {
    const serverData = { users: 50, fraud: 5, highRisk: 2, transactions: [], highRiskUsers: [] };
    vi.stubGlobal("fetch", mockFetchSuccess(serverData));

    const result = await fetchAdminDashboard();
    expect(result).toEqual(serverData);
  });

  it("falls back to DUMMY data on network error", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await fetchAdminDashboard();
    expect(result.users).toBe(120);
    expect(result.fraud).toBe(15);
    expect(result.highRisk).toBe(7);
    expect(result.transactions).toHaveLength(6);
    expect(result.highRiskUsers).toHaveLength(3);
  });
});

// ── fetchUsers ───────────────────────────────────────────────
describe("fetchUsers", () => {
  it("returns server data when fetch succeeds", async () => {
    const serverData = [{ id: 10, name: "Zara", email: "zara@example.com" }];
    vi.stubGlobal("fetch", mockFetchSuccess(serverData));

    const result = await fetchUsers();
    expect(result).toEqual(serverData);
  });

  it("falls back to DUMMY users on network error", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await fetchUsers();
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe("Alice");
  });
});

// ── sendTransaction ──────────────────────────────────────────
describe("sendTransaction", () => {
  it("returns server data when fetch succeeds", async () => {
    const serverData = { riskScore: 45, status: "LOW", requiresOTP: false };
    vi.stubGlobal("fetch", mockFetchSuccess(serverData));

    const result = await sendTransaction({ to: 1, amount: 500 });
    expect(result).toEqual(serverData);
  });

  it("calls fetch with correct payload", async () => {
    const mockFetch = mockFetchSuccess({ riskScore: 10, status: "LOW", requiresOTP: false });
    vi.stubGlobal("fetch", mockFetch);

    await sendTransaction({ to: 2, amount: 1000 });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/transaction",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: 2, amount: 1000 }),
      })
    );
  });

  it("falls back to random result on network error", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await sendTransaction({ to: 1, amount: 100 });
    expect(result).toHaveProperty("riskScore");
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThan(100);
    expect(["HIGH", "LOW"]).toContain(result.status);
    expect(typeof result.requiresOTP).toBe("boolean");
  });
});

// ── sendOTP ──────────────────────────────────────────────────
describe("sendOTP", () => {
  it("returns server data when fetch succeeds", async () => {
    vi.stubGlobal("fetch", mockFetchSuccess({ sent: true, message: "OTP dispatched" }));

    const result = await sendOTP();
    expect(result.sent).toBe(true);
  });

  it("falls back to { sent: true } on network error", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await sendOTP();
    expect(result).toEqual({ sent: true });
  });
});

// ── verifyOTP ────────────────────────────────────────────────
describe("verifyOTP", () => {
  it("returns server data when fetch succeeds", async () => {
    vi.stubGlobal("fetch", mockFetchSuccess({ verified: true }));

    const result = await verifyOTP("654321");
    expect(result.verified).toBe(true);
  });

  it("fallback: otp '123456' returns { verified: true }", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await verifyOTP("123456");
    expect(result.verified).toBe(true);
  });

  it("fallback: wrong otp returns { verified: false }", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await verifyOTP("000000");
    expect(result.verified).toBe(false);
  });

  it("fallback: partial otp returns { verified: false }", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await verifyOTP("12345");
    expect(result.verified).toBe(false);
  });
});

// ── fetchProfile ─────────────────────────────────────────────
describe("fetchProfile", () => {
  it("returns server data when fetch succeeds", async () => {
    const serverData = { name: "Server User", email: "server@test.com", balance: 9999, role: "admin" };
    vi.stubGlobal("fetch", mockFetchSuccess(serverData));

    const result = await fetchProfile();
    expect(result).toEqual(serverData);
  });

  it("falls back to DUMMY.profile when server fails and no localStorage user", async () => {
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await fetchProfile();
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.balance).toBe(5000);
    expect(result.role).toBe("user");
  });

  it("merges localStorage user into DUMMY.profile when server fails", async () => {
    localStorage.setItem("user", JSON.stringify({ name: "LocalUser", email: "local@test.com", role: "admin" }));
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await fetchProfile();
    expect(result.name).toBe("LocalUser");
    expect(result.email).toBe("local@test.com");
    expect(result.role).toBe("admin");
    // balance comes from DUMMY because localStorage user has no balance
    expect(result.balance).toBe(5000);
  });

  it("localStorage user only partially overrides DUMMY.profile", async () => {
    localStorage.setItem("user", JSON.stringify({ name: "PartialUser" }));
    vi.stubGlobal("fetch", mockFetchNetworkError());

    const result = await fetchProfile();
    expect(result.name).toBe("PartialUser");
    expect(result.email).toBe("john@example.com"); // still from DUMMY
  });
});