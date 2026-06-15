import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Transactions from "./Transactions";

vi.mock("../services/api", () => ({
  fetchUsers: vi.fn(),
  sendTransaction: vi.fn(),
  sendOTP: vi.fn(),
  verifyOTP: vi.fn(),
}));

vi.mock("../components/OTPModal", () => ({
  default: ({ onVerify, onCancel }) => (
    <div data-testid="otp-modal">
      <button onClick={() => onVerify("123456")}>Verify 123456</button>
      <button onClick={() => onVerify("000000")}>Verify Wrong</button>
      <button onClick={onCancel}>Cancel OTP</button>
    </div>
  ),
}));

import { fetchUsers, sendTransaction, sendOTP, verifyOTP } from "../services/api";

const DUMMY_USERS = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" },
];

beforeEach(() => {
  vi.useFakeTimers();
  fetchUsers.mockResolvedValue(DUMMY_USERS);
  sendTransaction.mockResolvedValue({ riskScore: 30, status: "LOW", requiresOTP: false });
  sendOTP.mockResolvedValue({ sent: true });
  verifyOTP.mockResolvedValue({ verified: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// ── Initial render ───────────────────────────────────────────
describe("Transactions — initial render", () => {
  it("renders Send Transaction heading", async () => {
    render(<Transactions />);
    expect(screen.getByText("Send Transaction")).toBeInTheDocument();
  });

  it("renders Recipient and Amount cards", async () => {
    render(<Transactions />);
    await waitFor(() => {
      expect(screen.getByText("Recipient")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
    });
  });

  it("renders Send Money button in idle state", async () => {
    render(<Transactions />);
    await waitFor(() =>
      expect(screen.getByText("Send Money")).toBeInTheDocument()
    );
  });

  it("calls fetchUsers on mount", async () => {
    render(<Transactions />);
    await waitFor(() => expect(fetchUsers).toHaveBeenCalledTimes(1));
  });
});

// ── User search ──────────────────────────────────────────────
describe("Transactions — user search", () => {
  it("shows user list when search input has content", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Ali");
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("hides user list when search is empty", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Ali");
    expect(screen.getByText("Alice")).toBeInTheDocument();
    await user.clear(searchInput);
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("shows no results message when search matches no user", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Zzzz");
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("filters users by email address", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "bob@");
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("search is case-insensitive for name", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "CHARLIE");
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });
});

// ── Recipient selection ──────────────────────────────────────
describe("Transactions — recipient selection", () => {
  it("selecting a user clears the search and shows selected user", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Bob");
    fireEvent.click(screen.getByText("Bob"));

    // User list disappears and selected user shows
    expect(screen.queryByPlaceholderText("Search user by name or email…")).toHaveValue("");
    expect(screen.getByText("Bob (bob@example.com)")).toBeInTheDocument();
  });

  it("clicking the clear button removes selected user", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));

    expect(screen.getByText("Alice (alice@example.com)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("✕"));
    expect(screen.queryByText("Alice (alice@example.com)")).not.toBeInTheDocument();
  });
});

// ── Validation ───────────────────────────────────────────────
describe("Transactions — form validation", () => {
  it("shows error when no recipient is selected", async () => {
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    fireEvent.click(screen.getByText("Send Money"));
    expect(screen.getByText("Select a recipient")).toBeInTheDocument();
  });

  it("shows error when amount is empty", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    // Select a recipient first
    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));

    fireEvent.click(screen.getByText("Send Money"));
    expect(screen.getByText("Enter a valid amount")).toBeInTheDocument();
  });

  it("shows error when amount is zero", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));

    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "0");
    fireEvent.click(screen.getByText("Send Money"));
    expect(screen.getByText("Enter a valid amount")).toBeInTheDocument();
  });

  it("shows error when amount is negative", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));

    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "-100");
    fireEvent.click(screen.getByText("Send Money"));
    expect(screen.getByText("Enter a valid amount")).toBeInTheDocument();
  });
});

// ── Transaction flow — no OTP ────────────────────────────────
describe("Transactions — no OTP flow", () => {
  it("shows processing status after Send Money is clicked", async () => {
    sendTransaction.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "500");

    fireEvent.click(screen.getByText("Send Money"));
    expect(screen.getByText("Processing transaction…")).toBeInTheDocument();
  });

  it("shows updating status after processing completes without OTP", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "500");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });

    await waitFor(() =>
      expect(screen.getByText("Updating balance…")).toBeInTheDocument()
    );
  });

  it("shows done status after 1500ms timeout", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "500");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });

    await waitFor(() => screen.getByText("Updating balance…"));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() =>
      expect(screen.getByText("Transaction Complete!")).toBeInTheDocument()
    );
  });

  it("shows risk score and status in done state", async () => {
    sendTransaction.mockResolvedValue({ riskScore: 30, status: "LOW", requiresOTP: false });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "500");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });
    await waitFor(() => screen.getByText("Updating balance…"));
    act(() => { vi.advanceTimersByTime(1500); });

    await waitFor(() => {
      expect(screen.getByText("30")).toBeInTheDocument();
    });
  });
});

// ── Transaction flow — with OTP ──────────────────────────────
describe("Transactions — OTP flow", () => {
  beforeEach(() => {
    sendTransaction.mockResolvedValue({ riskScore: 85, status: "HIGH", requiresOTP: true });
  });

  it("shows OTP modal when transaction requires OTP", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "5000");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });

    await waitFor(() =>
      expect(screen.getByTestId("otp-modal")).toBeInTheDocument()
    );
  });

  it("calls sendOTP when OTP is required", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Bob");
    fireEvent.click(screen.getByText("Bob"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "1000");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });

    await waitFor(() => expect(sendOTP).toHaveBeenCalledTimes(1));
  });

  it("proceeds to done after correct OTP is verified", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "5000");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });
    await waitFor(() => screen.getByTestId("otp-modal"));

    await act(async () => {
      fireEvent.click(screen.getByText("Verify 123456"));
    });

    await waitFor(() => screen.getByText("Updating balance…"));
    act(() => { vi.advanceTimersByTime(1500); });
    await waitFor(() =>
      expect(screen.getByText("Transaction Complete!")).toBeInTheDocument()
    );
  });

  it("shows error for invalid OTP", async () => {
    verifyOTP.mockResolvedValue({ verified: false });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "5000");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });
    await waitFor(() => screen.getByTestId("otp-modal"));

    await act(async () => {
      fireEvent.click(screen.getByText("Verify Wrong"));
    });

    await waitFor(() =>
      expect(screen.getByText("Invalid OTP. Try 123456.")).toBeInTheDocument()
    );
  });

  it("cancelling OTP modal returns to idle state", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "5000");

    await act(async () => {
      fireEvent.click(screen.getByText("Send Money"));
    });
    await waitFor(() => screen.getByTestId("otp-modal"));

    await act(async () => {
      fireEvent.click(screen.getByText("Cancel OTP"));
    });

    await waitFor(() =>
      expect(screen.getByText("Send Money")).toBeInTheDocument()
    );
    expect(screen.queryByTestId("otp-modal")).not.toBeInTheDocument();
  });
});

// ── handleReset ──────────────────────────────────────────────
describe("Transactions — reset after done", () => {
  it("clicking New Transaction resets back to idle form", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Alice");
    fireEvent.click(screen.getByText("Alice"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "500");

    await act(async () => { fireEvent.click(screen.getByText("Send Money")); });
    await waitFor(() => screen.getByText("Updating balance…"));
    act(() => { vi.advanceTimersByTime(1500); });
    await waitFor(() => screen.getByText("Transaction Complete!"));

    fireEvent.click(screen.getByText("New Transaction"));
    await waitFor(() =>
      expect(screen.getByText("Send Money")).toBeInTheDocument()
    );
    expect(screen.queryByText("Transaction Complete!")).not.toBeInTheDocument();
  });
});

// ── sendTransaction payload ──────────────────────────────────
describe("Transactions — API call payload", () => {
  it("sends correct recipient id and numeric amount to sendTransaction", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Transactions />);
    await waitFor(() => screen.getByText("Send Money"));

    const searchInput = screen.getByPlaceholderText("Search user by name or email…");
    await user.type(searchInput, "Bob");
    fireEvent.click(screen.getByText("Bob"));
    const amountInput = screen.getByPlaceholderText("0.00");
    await user.type(amountInput, "750");

    await act(async () => { fireEvent.click(screen.getByText("Send Money")); });

    await waitFor(() =>
      expect(sendTransaction).toHaveBeenCalledWith({ to: 2, amount: 750 })
    );
  });
});