import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Admin from "./Admin";

vi.mock("../services/api", () => ({
  fetchAdminDashboard: vi.fn(),
}));

import { fetchAdminDashboard } from "../services/api";

const DUMMY_ADMIN_DATA = {
  users: 120,
  fraud: 15,
  highRisk: 7,
  transactions: [
    { id: "TXN001", from: "John", to: "Alice", amount: 1200, date: "2026-06-13", status: "LOW", riskScore: 22 },
    { id: "TXN002", from: "Mike", to: "Bob", amount: 8500, date: "2026-06-12", status: "HIGH", riskScore: 81 },
    { id: "TXN006", from: "Paul", to: "Frank", amount: 22000, date: "2026-06-08", status: "HIGH", riskScore: 91 },
  ],
  highRiskUsers: [
    { name: "Mike", email: "mike@example.com", riskScore: 81 },
    { name: "Tom", email: "tom@example.com", riskScore: 78 },
    { name: "Paul", email: "paul@example.com", riskScore: 91 },
  ],
};

beforeEach(() => {
  fetchAdminDashboard.mockResolvedValue(DUMMY_ADMIN_DATA);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Admin — loading state", () => {
  it("shows loading indicator before data arrives", () => {
    // Never resolves during this test
    fetchAdminDashboard.mockReturnValue(new Promise(() => {}));
    render(<Admin />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("removes loading indicator once data is available", async () => {
    render(<Admin />);
    await waitFor(() => expect(screen.queryByText("Loading…")).not.toBeInTheDocument());
  });
});

describe("Admin — page title", () => {
  it("renders Admin Dashboard heading", async () => {
    render(<Admin />);
    await waitFor(() => expect(screen.getByText("Admin Dashboard")).toBeInTheDocument());
  });
});

describe("Admin — metrics display", () => {
  it("displays Total Users value", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("120")).toBeInTheDocument();
    });
    expect(screen.getByText("Total Users")).toBeInTheDocument();
  });

  it("displays Fraud Detected value", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("15")).toBeInTheDocument();
    });
    expect(screen.getByText("Fraud Detected")).toBeInTheDocument();
  });

  it("displays High Risk Users count", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();
    });
    expect(screen.getByText("High Risk Users")).toBeInTheDocument();
  });
});

describe("Admin — high-risk user alerts", () => {
  it("renders the High-Risk User Alerts section title", async () => {
    render(<Admin />);
    await waitFor(() =>
      expect(screen.getByText("🚨 High-Risk User Alerts")).toBeInTheDocument()
    );
  });

  it("renders an alert card for each high-risk user", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("Mike")).toBeInTheDocument();
      expect(screen.getByText("Tom")).toBeInTheDocument();
      expect(screen.getByText("Paul")).toBeInTheDocument();
    });
  });

  it("renders emails for each high-risk user", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("mike@example.com")).toBeInTheDocument();
      expect(screen.getByText("tom@example.com")).toBeInTheDocument();
      expect(screen.getByText("paul@example.com")).toBeInTheDocument();
    });
  });

  it("renders risk badge scores for high-risk users", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("Score: 81")).toBeInTheDocument();
      expect(screen.getByText("Score: 78")).toBeInTheDocument();
      expect(screen.getByText("Score: 91")).toBeInTheDocument();
    });
  });

  it("renders avatar initial for each high-risk user", async () => {
    render(<Admin />);
    await waitFor(() => {
      // M for Mike, T for Tom, P for Paul
      const avatars = document.querySelectorAll(".avatar");
      const initials = Array.from(avatars).map((el) => el.textContent);
      expect(initials).toContain("M");
      expect(initials).toContain("T");
      expect(initials).toContain("P");
    });
  });
});

describe("Admin — transactions table", () => {
  it("renders All Transactions section heading", async () => {
    render(<Admin />);
    await waitFor(() =>
      expect(screen.getByText("All Transactions")).toBeInTheDocument()
    );
  });

  it("renders table headers: ID, From, To, Amount, Date, Risk, Status", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("ID")).toBeInTheDocument();
      expect(screen.getByText("From")).toBeInTheDocument();
      expect(screen.getByText("To")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Risk")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  it("renders transaction IDs in table", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("TXN001")).toBeInTheDocument();
      expect(screen.getByText("TXN002")).toBeInTheDocument();
      expect(screen.getByText("TXN006")).toBeInTheDocument();
    });
  });

  it("renders transaction sender names", async () => {
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });

  it("renders status pills for HIGH transactions", async () => {
    render(<Admin />);
    await waitFor(() => {
      const statusPills = document.querySelectorAll(".status-pill.high");
      expect(statusPills.length).toBeGreaterThan(0);
    });
  });

  it("renders status pills for LOW transactions", async () => {
    render(<Admin />);
    await waitFor(() => {
      const statusPills = document.querySelectorAll(".status-pill.low");
      expect(statusPills.length).toBeGreaterThan(0);
    });
  });

  it("calls fetchAdminDashboard exactly once on mount", async () => {
    render(<Admin />);
    await waitFor(() => screen.getByText("Admin Dashboard"));
    expect(fetchAdminDashboard).toHaveBeenCalledTimes(1);
  });
});

describe("Admin — empty state", () => {
  it("renders no alert cards when highRiskUsers is empty", async () => {
    fetchAdminDashboard.mockResolvedValue({
      ...DUMMY_ADMIN_DATA,
      highRiskUsers: [],
    });
    render(<Admin />);
    await waitFor(() => screen.getByText("Admin Dashboard"));
    const alertCards = document.querySelectorAll(".alert-card");
    expect(alertCards).toHaveLength(0);
  });

  it("renders no transaction rows when transactions is empty", async () => {
    fetchAdminDashboard.mockResolvedValue({
      ...DUMMY_ADMIN_DATA,
      transactions: [],
    });
    render(<Admin />);
    await waitFor(() => screen.getByText("Admin Dashboard"));
    const rows = document.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(0);
  });
});