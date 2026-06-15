import { useEffect, useState } from "react";
import { fetchUsers, sendTransaction, sendOTP, verifyOTP } from "../services/api";
import OTPModal from "../components/OTPModal";

export default function Transactions() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("idle"); // idle | processing | otp | updating | done
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!selected) { setError("Select a recipient"); return; }
    if (!amount || Number(amount) <= 0) { setError("Enter a valid amount"); return; }
    setError("");
    setStep("processing");
    const res = await sendTransaction({ to: selected.id, amount: Number(amount) });
    setResult(res);

    if (res.requiresOTP) {
      await sendOTP();
      setStep("otp");
    } else {
      setStep("updating");
      setTimeout(() => setStep("done"), 1500);
    }
  };

  const handleVerify = async (otp) => {
    const res = await verifyOTP(otp);
    if (res.verified) {
      setStep("updating");
      setTimeout(() => setStep("done"), 1500);
    } else {
      setError("Invalid OTP. Try 123456.");
    }
  };

  const handleReset = () => {
    setSelected(null);
    setAmount("");
    setResult(null);
    setStep("idle");
    setError("");
  };

  return (
    <div className="page transactions-page">
      <h1 className="page-title">Send Transaction</h1>

      {step === "otp" && (
        <OTPModal
          onVerify={handleVerify}
          onCancel={() => { setStep("idle"); setResult(null); }}
        />
      )}

      {/* Status overlays */}
      {step === "processing" && (
        <div className="tx-status processing">
          <div className="spinner" />
          <p>Processing transaction…</p>
        </div>
      )}
      {step === "updating" && (
        <div className="tx-status updating">
          <div className="spinner" />
          <p>Updating balance…</p>
        </div>
      )}
      {step === "done" && (
        <div className="tx-status done">
          <span className="done-icon">✅</span>
          <h2>Transaction Complete!</h2>
          {result && (
            <div className="result-summary">
              <p>Risk Score: <strong>{result.riskScore}</strong></p>
              <p>
                Status:{" "}
                <span className={`status-pill ${result.status.toLowerCase()}`}>
                  {result.status}
                </span>
              </p>
            </div>
          )}
          <button className="btn btn-primary" onClick={handleReset}>
            New Transaction
          </button>
        </div>
      )}

      {/* Form */}
      {(step === "idle" || step === "otp") && (
        <div className="tx-form-wrapper">
          <div className="card tx-card">
            <h3>Recipient</h3>
            <input
              type="text"
              placeholder="Search user by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tx-search"
            />
            {search && (
              <div className="user-list">
                {filtered.length === 0 && <p className="no-results">No users found</p>}
                {filtered.map((u) => (
                  <button
                    key={u.id}
                    className={`user-item ${selected?.id === u.id ? "selected" : ""}`}
                    onClick={() => { setSelected(u); setSearch(""); }}
                  >
                    <span className="avatar-sm">{u.name[0]}</span>
                    <div>
                      <p className="user-name">{u.name}</p>
                      <p className="user-email">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <div className="selected-user">
                <span className="avatar-sm">{selected.name[0]}</span>
                <p>{selected.name} ({selected.email})</p>
                <button className="btn-clear" onClick={() => setSelected(null)}>✕</button>
              </div>
            )}
          </div>

          <div className="card tx-card">
            <h3>Amount</h3>
            <div className="amount-input-row">
              <span className="currency">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="amount-input"
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary btn-full" onClick={handleSend}>
            Send Money
          </button>
        </div>
      )}
    </div>
  );
}
