import { useEffect, useState } from "react";
import { fetchUserDashboard } from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchUserDashboard().then(setData);
  }, []);

  if (!data) return <div className="page-loader">Loading…</div>;

  const riskColor =
    data.riskScore >= 70 ? "var(--danger)" : data.riskScore >= 40 ? "var(--warning)" : "var(--success)";
  const riskLabel =
    data.riskScore >= 70 ? "HIGH RISK" : data.riskScore >= 40 ? "MEDIUM" : "LOW";

  return (
    <div className="page dashboard-page">
      <h1 className="page-title">User Dashboard</h1>

      {/* Alert Banner */}
      {data.riskScore >= 70 && (
        <div className="alert alert-danger">
          ⚠️ <strong>High Risk Alert:</strong> Your account shows unusual
          activity. Please review recent transactions immediately.
        </div>
      )}

      {/* Top Metrics */}
      <div className="metrics-row">
        <div className="card metric-card risk-card">
          <p className="metric-label">Risk Score</p>
          <div className="risk-circle" style={{ "--risk-color": riskColor }}>
            <span className="risk-value">{data.riskScore}</span>
          </div>
          <span className="risk-badge" style={{ background: riskColor }}>
            {riskLabel}
          </span>
        </div>

        <div className="card metric-card">
          <p className="metric-label">Account Balance</p>
          <p className="metric-value">₹{data.balance.toLocaleString()}</p>
          <p className="metric-sub">Available balance</p>
        </div>
      </div>

      {/* Behaviour Insights */}
      <section className="section">
        <h2 className="section-title">🧠 Behaviour Insights</h2>
        <div className="insights-list">
          {data.insights.map((ins, i) => (
            <div className="insight-item" key={i}>
              <span className="insight-icon">🔍</span>
              <p>{ins}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Explanation */}
      <section className="section">
        <h2 className="section-title">🤖 AI Explanation</h2>
        <div className="card ai-card">
          <p>{data.aiExplanation}</p>
        </div>
      </section>

      {/* Last Transactions */}
      <section className="section">
        <h2 className="section-title">Recent Transactions</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>To</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="mono">{tx.id}</td>
                  <td>{tx.to}</td>
                  <td>₹{tx.amount.toLocaleString()}</td>
                  <td>{tx.date}</td>
                  <td>
                    <span
                      className="risk-dot"
                      style={{
                        background:
                          tx.riskScore >= 70
                            ? "var(--danger)"
                            : tx.riskScore >= 40
                            ? "var(--warning)"
                            : "var(--success)",
                      }}
                    />
                    {tx.riskScore}
                  </td>
                  <td>
                    <span className={`status-pill ${tx.status.toLowerCase()}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
