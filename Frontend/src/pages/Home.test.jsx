import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "./Home";

vi.mock("../services/api", () => ({
  fetchHome: vi.fn(),
}));

import { fetchHome } from "../services/api";

const DUMMY_HOME_DATA = {
  title: "AI Fraud Detection System",
  description:
    "Advanced machine-learning powered banking security that monitors transactions in real-time, detects anomalies, and protects your finances 24/7.",
  features: [
    {
      icon: "🧠",
      name: "Behaviour Analysis",
      detail: "Deep-learning models analyse spending patterns.",
    },
    {
      icon: "📊",
      name: "Risk Scoring",
      detail: "Each transaction receives a real-time risk score from 0–100.",
    },
    {
      icon: "🔐",
      name: "OTP Security",
      detail: "Suspicious transactions require a one-time password.",
    },
  ],
  announcements: [
    "System maintenance scheduled for June 20, 2026 – 02:00 to 04:00 UTC.",
    "New AI model v3.2 deployed — 18% improvement in fraud detection accuracy.",
    "Two-factor authentication is now mandatory for all admin accounts.",
  ],
};

beforeEach(() => {
  fetchHome.mockResolvedValue(DUMMY_HOME_DATA);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Home — loading state", () => {
  it("shows loading indicator before data arrives", () => {
    fetchHome.mockReturnValue(new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("removes loading indicator once data is available", async () => {
    render(<Home />);
    await waitFor(() => expect(screen.queryByText("Loading…")).not.toBeInTheDocument());
  });
});

describe("Home — hero section", () => {
  it("renders the hero title from API data", async () => {
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByText("AI Fraud Detection System")).toBeInTheDocument()
    );
  });

  it("renders the hero description from API data", async () => {
    render(<Home />);
    await waitFor(() =>
      expect(
        screen.getByText(/Advanced machine-learning powered banking security/)
      ).toBeInTheDocument()
    );
  });

  it("renders AI Powered badge", async () => {
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByText("AI Powered")).toBeInTheDocument()
    );
  });

  it("renders Real-Time badge", async () => {
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByText("Real-Time")).toBeInTheDocument()
    );
  });

  it("renders Bank-Grade Security badge", async () => {
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByText("Bank-Grade Security")).toBeInTheDocument()
    );
  });

  it("renders hero-glow element", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("AI Fraud Detection System"));
    expect(document.querySelector(".hero-glow")).toBeInTheDocument();
  });
});

describe("Home — features section", () => {
  it("renders Core Features heading", async () => {
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByText("Core Features")).toBeInTheDocument()
    );
  });

  it("renders all three feature names", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("Behaviour Analysis")).toBeInTheDocument();
      expect(screen.getByText("Risk Scoring")).toBeInTheDocument();
      expect(screen.getByText("OTP Security")).toBeInTheDocument();
    });
  });

  it("renders feature detail text for each feature", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(
        screen.getByText("Deep-learning models analyse spending patterns.")
      ).toBeInTheDocument();
    });
  });

  it("renders feature icons", async () => {
    render(<Home />);
    await waitFor(() => {
      const featureCards = document.querySelectorAll(".feature-card");
      expect(featureCards).toHaveLength(3);
    });
  });

  it("renders a custom title from API when different from default", async () => {
    fetchHome.mockResolvedValue({ ...DUMMY_HOME_DATA, title: "Custom System Title" });
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByText("Custom System Title")).toBeInTheDocument()
    );
  });
});

describe("Home — announcements section", () => {
  it("renders Announcements heading", async () => {
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByText("📢 Announcements")).toBeInTheDocument()
    );
  });

  it("renders all announcement items", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(
        screen.getByText("System maintenance scheduled for June 20, 2026 – 02:00 to 04:00 UTC.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("New AI model v3.2 deployed — 18% improvement in fraud detection accuracy.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Two-factor authentication is now mandatory for all admin accounts.")
      ).toBeInTheDocument();
    });
  });

  it("renders announcement-dot element for each announcement", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("📢 Announcements"));
    const dots = document.querySelectorAll(".announcement-dot");
    expect(dots).toHaveLength(3);
  });

  it("renders no announcements when list is empty", async () => {
    fetchHome.mockResolvedValue({ ...DUMMY_HOME_DATA, announcements: [] });
    render(<Home />);
    await waitFor(() => screen.getByText("📢 Announcements"));
    const dots = document.querySelectorAll(".announcement-dot");
    expect(dots).toHaveLength(0);
  });
});

describe("Home — API call", () => {
  it("calls fetchHome exactly once on mount", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("AI Fraud Detection System"));
    expect(fetchHome).toHaveBeenCalledTimes(1);
  });
});