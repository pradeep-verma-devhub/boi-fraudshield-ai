import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mock all page components to isolate App logic
vi.mock("./pages/Home", () => ({ default: () => <div>Home Page</div> }));
vi.mock("./pages/Login", () => ({ default: () => <div>Login Page</div> }));
vi.mock("./pages/Dashboard", () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock("./pages/Admin", () => ({ default: () => <div>Admin Page</div> }));
vi.mock("./pages/Transactions", () => ({ default: () => <div>Transactions Page</div> }));
vi.mock("./pages/Profile", () => ({ default: () => <div>Profile Page</div> }));
vi.mock("./components/Navbar", () => ({
  default: ({ theme, setTheme }) => (
    <div data-testid="navbar" data-theme={theme}>
      <button onClick={() => setTheme("light")}>Set Light</button>
    </div>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App — theme initialisation", () => {
  it("defaults to dark theme when no localStorage value is set", () => {
    render(<App />);
    const navbar = screen.getByTestId("navbar");
    expect(navbar).toHaveAttribute("data-theme", "dark");
  });

  it("reads theme from localStorage on mount", () => {
    localStorage.setItem("theme", "light");
    render(<App />);
    const navbar = screen.getByTestId("navbar");
    expect(navbar).toHaveAttribute("data-theme", "light");
  });

  it("reads grey theme from localStorage on mount", () => {
    localStorage.setItem("theme", "grey");
    render(<App />);
    const navbar = screen.getByTestId("navbar");
    expect(navbar).toHaveAttribute("data-theme", "grey");
  });
});

describe("App — data-theme synchronisation", () => {
  it("sets data-theme attribute on documentElement on initial render (dark default)", async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });
  });

  it("sets data-theme attribute on documentElement from localStorage", async () => {
    localStorage.setItem("theme", "light");
    render(<App />);
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
  });

  it("updates data-theme on documentElement when theme changes via setTheme", async () => {
    const { getByText } = render(<App />);
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });

    // The mocked Navbar has a "Set Light" button that calls setTheme("light")
    getByText("Set Light").click();
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
  });
});

describe("App — routing", () => {
  it("renders Home page at root path by default", () => {
    render(<App />);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("renders Navbar component", () => {
    render(<App />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });
});