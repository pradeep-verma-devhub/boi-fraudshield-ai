import { useEffect, useState } from "react";
import { fetchHome } from "../services/api";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchHome().then(setData);
  }, []);

  if (!data) return <div className="page-loader">Loading…</div>;

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-glow" />
        <h1 className="hero-title">{data.title}</h1>
        <p className="hero-desc">{data.description}</p>
        <div className="hero-badges">
          <span className="badge badge-accent">AI Powered</span>
          <span className="badge badge-accent">Real-Time</span>
          <span className="badge badge-accent">Bank-Grade Security</span>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Core Features</h2>
        <div className="card-grid">
          {data.features.map((f, i) => (
            <div className="card feature-card" key={i}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.name}</h3>
              <p>{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">📢 Announcements</h2>
        <div className="announcements">
          {data.announcements.map((a, i) => (
            <div className="announcement-item" key={i}>
              <span className="announcement-dot" />
              <p>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
