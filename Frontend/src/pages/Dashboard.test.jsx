import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";

vi.mock("../services/api", () => ({
  fetchUserDashboard: vi.fn(),
}));

import { fetchUserDashboard } from "../services/api";

const LOW_RISK_DATA = {
  riskScore: 25,
  balance: 5000,
  insights: ["Steady spending pattern detected", "Login from usual location"],
  aiExplanation: "Your account activity appears normal.",
  transactions: [
    { id: "TXN001", to: "Alice", amount: 1200, date: "2026-06-13", status: "LOW", riskScore: 22 },
    { id: "TXN003", to: "Charlie", amount: 300, date: "2026-06-11", status: "LOW", riskScore: 15 },
  ],
};

const HIGH_RISK_DATA = {
  riskScore: 72,
  balance: 5000,
  insights: [
    "Unusual night transaction detected at 02:14 AM",
    "Multiple logins from different cities within 1 hour",
    "High-value transfer to a new beneficiary",
  ],
  aiExplanation:
    "Your risk score increased due to a late-night transaction from an unrecognised device.",
  transactions: [
    { id: "TXN002", to: "Bob", amount: 8500, date: "2026-06-12", status: "HIGH", riskScore: 81 },
    { id: "TXN004", to: "Diana", amount: 15000, date: "2026-06-10", status: "HIGH", riskScore: 78 },
  ],
};

const MEDIUM_RISK_DATA = {
  ...LOW_RISK_DATA,
  riskScore: 55,
};

beforeEach(() => {
  fetchUserDashboard.mockResolvedValue(LOW_RISK_DATA);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Dashboard — loading state", () => {
  it("shows loading indicator before data arrives", () => {
    fetchUserDashboard.mockReturnValue(new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("removes loading indicator once data loads", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.queryByText("Loading…")).not.toBeInTheDocument());
  });
});

describe("Dashboard — page title", () => {
  it("renders User Dashboard heading", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("User Dashboard")).toBeInTheDocument());
  });
});

describe("Dashboard — high risk alert banner", () => {
  it("shows high risk alert when riskScore >= 70", async () => {
    fetchUserDashboard.mockResolvedValue(HIGH_RISK_DATA);
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText("High Risk Alert:")).toBeInTheDocument()
    );
  });

  it("does NOT show high risk alert when riskScore < 70", async () => {
    render(<Dashboard />);
    await waitFor(() => screen.getByText("User Dashboard"));
    expect(screen.queryByText("High Risk Alert:")).not.toBeInTheDocument();
  });

  it("does NOT show high risk alert at riskScore exactly 69", async () => {
    fetchUserDashboard.mockResolvedValue({ ...LOW_RISK_DATA, riskScore: 69 });
    render(<Dashboard />);
    await waitFor(() => screen.getByText("User Dashboard"));
    expect(screen.queryByText("High Risk Alert:")).not.toBeInTheDocument();
  });

  it("shows high risk alert at riskScore exactly 70 (boundary)", async () => {
    fetchUserDashboard.mockResolvedValue({ ...LOW_RISK_DATA, riskScore: 70 });
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText("High Risk Alert:")).toBeInTheDocument()
    );
  });
});

describe("Dashboard — risk score display", () => {
  it("renders the risk score value", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("25")).toBeInTheDocument());
  });

  it("renders HIGH RISK label when riskScore >= 70", async () => {
    fetchUserDashboard.mockResolvedValue(HIGH_RISK_DATA);
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("HIGH RISK")).toBeInTheDocument());
  });

  it("renders MEDIUM label when riskScore is between 40 and 69", async () => {
    fetchUserDashboard.mockResolvedValue(MEDIUM_RISK_DATA);
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("MEDIUM")).toBeInTheDocument());
  });

  it("renders LOW label when riskScore < 40", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("LOW")).toBeInTheDocument());
  });

  it("renders MEDIUM at boundary riskScore of 40", async () => {
    fetchUserDashboard.mockResolvedValue({ ...LOW_RISK_DATA, riskScore: 40 });
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("MEDIUM")).toBeInTheDocument());
  });
});

describe("Dashboard — account balance", () => {
  it("renders account balance", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("₹5,000")).toBeInTheDocument());
  });

  it("renders Account Balance label", async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText("Account Balance")).toBeInTheDocument());
  });
});

describe("Dashboard — behaviour insights", () => {
  it("renders the Behaviour Insights section title", async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText("🧠 Behaviour Insights")).toBeInTheDocument()
    );
  });

  it("renders each insight item", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Steady spending pattern detected")).toBeInTheDocument();
      expect(screen.getByText("Login from usual location")).toBeInTheDocument();
    });
  });

  it("renders insight items with magnifying glass icon", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      const icons = document.querySelectorAll(".insight-icon");
      expect(icons.length).toBe(LOW_RISK_DATA.insights.length);
    });
  });
});

describe("Dashboard — AI explanation", () => {
  it("renders the AI Explanation section title", async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText("🤖 AI Explanation")).toBeInTheDocument()
    );
  });

  it("renders the AI explanation text", async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(
        screen.getByText("Your account activity appears normal.")
      ).toBeInTheDocument()
    );
  });
});

describe("Dashboard — recent transactions table", () => {
  it("renders Recent Transactions section heading", async () => {
    render(<Dashboard />);
    await waitFor(() =>
      expect(screen.getByText("Recent Transactions")).toBeInTheDocument()
    );
  });

  it("renders table headers", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("To")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Risk")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  it("renders transaction IDs in the table", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("TXN001")).toBeInTheDocument();
      expect(screen.getByText("TXN003")).toBeInTheDocument();
    });
  });

  it("renders status pill with 'low' class for LOW status transactions", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      const lowPills = document.querySelectorAll(".status-pill.low");
      expect(lowPills.length).toBeGreaterThan(0);
    });
  });

  it("renders status pill with 'high' class for HIGH status transactions", async () => {
    fetchUserDashboard.mockResolvedValue(HIGH_RISK_DATA);
    render(<Dashboard />);
    await waitFor(() => {
      const highPills = document.querySelectorAll(".status-pill.high");
      expect(highPills.length).toBeGreaterThan(0);
    });
  });

  it("calls fetchUserDashboard exactly once on mount", async () => {
    render(<Dashboard />);
    await waitFor(() => screen.getByText("User Dashboard"));
    expect(fetchUserDashboard).toHaveBeenCalledTimes(1);
  });
});