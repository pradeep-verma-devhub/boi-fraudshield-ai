import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "../services/api";

export default function Admin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAdminDashboard().then(setData);
  }, []);

  if (!data) return <div className="page-loader">Loading…</div>;

  return (
    <div className="page admin-page">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="metrics-row three-col">
        <div className="card metric-card">
          <p className="metric-label">Total Users</p>
          <p className="metric-value accent">{data.users}</p>
          <p className="metric-sub">Registered accounts</p>
        </div>
        <div className="card metric-card">
          <p className="metric-label">Fraud Detected</p>
          <p className="metric-value danger">{data.fraud}</p>
          <p className="metric-sub">Flagged transactions</p>
        </div>
        <div className="card metric-card">
          <p className="metric-label">High Risk Users</p>
          <p className="metric-value warning">{data.highRisk}</p>
          <p className="metric-sub">Require monitoring</p>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">🚨 High-Risk User Alerts</h2>
        <div className="alert-cards">
          {data.highRiskUsers.map((u, i) => (
            <div className="card alert-card" key={i}>
              <div className="alert-card-head">
                <span className="avatar">{u.name[0]}</span>
                <div>
                  <p className="alert-name">{u.name}</p>
                  <p className="alert-email">{u.email}</p>
                </div>
              </div>
              <span className="risk-badge" style={{ background: "var(--danger)" }}>
                Score: {u.riskScore}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">All Transactions</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>From</th>
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
                  <td>{tx.from}</td>
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
