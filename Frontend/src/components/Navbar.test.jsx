import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

// Helper to render Navbar inside a MemoryRouter at a given route
function renderNavbar({ theme = "dark", setTheme = vi.fn(), initialPath = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar theme={theme} setTheme={setTheme} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  // Default to non-mobile window width
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

// ── Brand & basic rendering ──────────────────────────────────
describe("Navbar — brand rendering", () => {
  it("renders the FraudGuard AI brand text", () => {
    renderNavbar();
    expect(screen.getAllByText("FraudGuard AI").length).toBeGreaterThan(0);
  });

  it("renders the shield brand icon", () => {
    renderNavbar();
    // Brand icon text appears in both navbar and drawer
    const icons = screen.getAllByText("🛡️");
    expect(icons.length).toBeGreaterThan(0);
  });
});

// ── Navigation links ─────────────────────────────────────────
describe("Navbar — navigation links", () => {
  it("renders Home, Dashboard, Transactions, Profile links for non-admin users", () => {
    renderNavbar();
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Transactions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Profile").length).toBeGreaterThan(0);
  });

  it("does NOT render Admin link when user has no role", () => {
    renderNavbar();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("renders Admin link when user role is 'admin'", () => {
    localStorage.setItem("user", JSON.stringify({ role: "admin", name: "Admin User" }));
    renderNavbar();
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
  });

  it("does NOT render Admin link when user role is 'user'", () => {
    localStorage.setItem("user", JSON.stringify({ role: "user", name: "Regular User" }));
    renderNavbar();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });
});

// ── Theme cycling ────────────────────────────────────────────
describe("Navbar — theme cycling", () => {
  it("calls setTheme with 'light' when current theme is 'dark'", () => {
    const setTheme = vi.fn();
    renderNavbar({ theme: "dark", setTheme });
    const themeBtn = screen.getByTitle("Theme: dark");
    fireEvent.click(themeBtn);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("calls setTheme with 'grey' when current theme is 'light'", () => {
    const setTheme = vi.fn();
    renderNavbar({ theme: "light", setTheme });
    const themeBtn = screen.getByTitle("Theme: light");
    fireEvent.click(themeBtn);
    expect(setTheme).toHaveBeenCalledWith("grey");
  });

  it("calls setTheme with 'dark' when current theme is 'grey' (wraps around)", () => {
    const setTheme = vi.fn();
    renderNavbar({ theme: "grey", setTheme });
    const themeBtn = screen.getByTitle("Theme: grey");
    fireEvent.click(themeBtn);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("saves next theme to localStorage when cycling", () => {
    renderNavbar({ theme: "dark" });
    const themeBtn = screen.getByTitle("Theme: dark");
    fireEvent.click(themeBtn);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("displays moon icon for dark theme", () => {
    renderNavbar({ theme: "dark" });
    const themeBtn = screen.getByTitle("Theme: dark");
    expect(themeBtn.textContent).toBe("🌙");
  });

  it("displays sun icon for light theme", () => {
    renderNavbar({ theme: "light" });
    const themeBtn = screen.getByTitle("Theme: light");
    expect(themeBtn.textContent).toBe("☀️");
  });

  it("displays fog icon for grey theme", () => {
    renderNavbar({ theme: "grey" });
    const themeBtn = screen.getByTitle("Theme: grey");
    expect(themeBtn.textContent).toBe("🌫️");
  });
});

// ── Login / Logout ───────────────────────────────────────────
describe("Navbar — login/logout button", () => {
  it("shows Login link when no user is in localStorage", () => {
    renderNavbar();
    // Login appears in navbar-actions area (there may also be a drawer copy)
    expect(screen.getAllByText("Login").length).toBeGreaterThan(0);
  });

  it("shows Logout button when user is present in localStorage", () => {
    localStorage.setItem("user", JSON.stringify({ role: "user", name: "Alice" }));
    renderNavbar();
    expect(screen.getAllByText("Logout").length).toBeGreaterThan(0);
  });

  it("removes user from localStorage when Logout is clicked", () => {
    localStorage.setItem("user", JSON.stringify({ role: "user", name: "Alice" }));
    renderNavbar();
    const logoutBtns = screen.getAllByText("Logout");
    fireEvent.click(logoutBtns[0]);
    expect(localStorage.getItem("user")).toBeNull();
  });
});

// ── HOME_ROUTES set ──────────────────────────────────────────
describe("Navbar — HOME_ROUTES", () => {
  it("shows hamburger button on '/' route in desktop mode", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
    renderNavbar({ initialPath: "/" });
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("shows hamburger button on '/dashboard' route in desktop mode", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
    renderNavbar({ initialPath: "/dashboard" });
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("shows hamburger button on '/admin' route in desktop mode", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
    renderNavbar({ initialPath: "/admin" });
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("shows back button on '/profile' route in desktop mode", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
    renderNavbar({ initialPath: "/profile" });
    expect(screen.getByLabelText("Go back")).toBeInTheDocument();
  });

  it("shows back button on '/transactions' route in desktop mode", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1200 });
    renderNavbar({ initialPath: "/transactions" });
    expect(screen.getByLabelText("Go back")).toBeInTheDocument();
  });
});

// ── Mobile drawer ────────────────────────────────────────────
describe("Navbar — mobile drawer", () => {
  it("drawer is initially closed", () => {
    renderNavbar();
    const drawer = document.querySelector(".drawer");
    expect(drawer).not.toHaveClass("open");
  });

  it("clicking hamburger button opens the drawer", () => {
    renderNavbar();
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    const drawer = document.querySelector(".drawer");
    expect(drawer).toHaveClass("open");
  });

  it("clicking close button inside drawer closes it", () => {
    renderNavbar();
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    const closeBtn = screen.getByLabelText("Close menu");
    fireEvent.click(closeBtn);
    const drawer = document.querySelector(".drawer");
    expect(drawer).not.toHaveClass("open");
  });

  it("clicking overlay closes the drawer", () => {
    renderNavbar();
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    const overlay = document.querySelector(".drawer-overlay");
    fireEvent.click(overlay);
    const drawer = document.querySelector(".drawer");
    expect(drawer).not.toHaveClass("open");
  });

  it("drawer theme switcher sets theme and saves to localStorage", () => {
    const setTheme = vi.fn();
    renderNavbar({ theme: "dark", setTheme });
    // Open the drawer to access drawer theme options
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    // Click the "light" theme button inside drawer
    const lightBtn = screen.getByRole("button", { name: /☀️\s*light/i });
    fireEvent.click(lightBtn);
    expect(setTheme).toHaveBeenCalledWith("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});

// ── Active link class ────────────────────────────────────────
describe("Navbar — active link styling", () => {
  it("Home link has active class on '/' route", () => {
    renderNavbar({ initialPath: "/" });
    const homeLinks = screen.getAllByRole("link", { name: "Home" });
    const activeLink = homeLinks.find((el) => el.className.includes("active"));
    expect(activeLink).toBeDefined();
  });
});