import { useEffect, useState } from "react";
import { fetchProfile } from "../services/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile().then(setProfile);
  }, []);

  if (!profile) return <div className="page-loader">Loading…</div>;

  return (
    <div className="page profile-page">
      <h1 className="page-title">My Profile</h1>

      <div className="profile-wrapper">
        <div className="card profile-card">
          <div className="profile-avatar">
            <span>{profile.name?.[0] ?? "U"}</span>
          </div>
          <h2 className="profile-name">{profile.name}</h2>
          <span className={`role-badge ${profile.role}`}>
            {profile.role === "admin" ? "👑 Admin" : "👤 User"}
          </span>

          <div className="profile-details">
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{profile.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Balance</span>
              <span className="profile-value">₹{profile.balance?.toLocaleString()}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Role</span>
              <span className="profile-value" style={{ textTransform: "capitalize" }}>
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
