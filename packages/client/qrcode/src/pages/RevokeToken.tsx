/** @format */

import { useState } from "react";
import { observer } from "mobx-react-lite";
import "../App.css";

const RevokeToken = observer(() => {
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleRevoke = async () => {
    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const response = await fetch("/api/user/revoke", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("Token revoked successfully:", data.message);
        setSuccess(true);
        setToken("");
      } else {
        console.error("Token revocation failed:", data.message);
        throw new Error(data.message || "Token revocation failed");
      }
    } catch (err) {
      console.error("Failed to revoke token:", err);
      setError(err instanceof Error ? err.message : "Failed to revoke token");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
    if (error) setError("");
    if (success) setSuccess(false);
  };

  return (
    <div className="app-container">
      <div className="qrcode-wrapper">
        <h1>Revoke Token</h1>

        <div className="token-input-container">
          <input
            value={token}
            onChange={handleInputChange}
            placeholder="Paste your token here..."
            className="token-input"
            type="text"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}

        {success && (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <p className="token-info">Token revoked successfully!</p>
          </div>
        )}

        <div className="button-container">
          <button
            onClick={handleRevoke}
            disabled={loading || !token.trim()}
            className="revoke-btn"
          >
            {loading ? "Revoking..." : "Revoke Token"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default RevokeToken;
