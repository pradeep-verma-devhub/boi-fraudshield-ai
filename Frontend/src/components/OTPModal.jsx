import { useState } from "react";

export default function OTPModal({ onVerify, onCancel }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value, idx) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    await onVerify(code);
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">⚠️</div>
        <h2 className="modal-title">Suspicious Transaction Detected</h2>
        <p className="modal-subtitle">
          Our AI has flagged this transaction as potentially risky. Please enter
          the 6-digit OTP sent to your registered device to continue.
        </p>

        <div className="otp-inputs">
          {otp.map((d, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>

        {error && <p className="otp-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        </div>

        <p className="otp-hint">Demo OTP: <strong>123456</strong></p>
      </div>
    </div>
  );
}
