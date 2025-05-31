/** @format */

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "./stores";
import "./App.css";

const App = observer(() => {
  const { qrCodeStore } = useStores();

  useEffect(() => {
    qrCodeStore.fetchQRCode();

    return () => {
      qrCodeStore.cleanup();
    };
  }, [qrCodeStore]);

  return (
    <div className="app-container">
      <div className="qrcode-wrapper">
        <h1>QR Code Authentication</h1>

        {qrCodeStore.loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generating QR Code...</p>
          </div>
        )}

        {qrCodeStore.error && (
          <div className="error">
            <p>Error: {qrCodeStore.error}</p>
            <button
              onClick={() => qrCodeStore.fetchQRCode()}
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        )}

        {qrCodeStore.qrcode && !qrCodeStore.loading && (
          <div className="qrcode-container">
            {qrCodeStore.shouldShowQRCode && (
              <>
                <img
                  src={qrCodeStore.qrcode}
                  alt="QR Code"
                  className="qrcode-image"
                />
                <p className="instruction">Scan this QR code to authenticate</p>
              </>
            )}

            <div className="status-container">
              <p
                className="status-message"
                style={{ color: qrCodeStore.statusColor }}
              >
                {qrCodeStore.statusMessage}
              </p>

              {qrCodeStore.shouldShowPollingIndicator && (
                <div className="polling-indicator">
                  <div className="pulse-dot"></div>
                  <span>Checking status...</span>
                </div>
              )}
            </div>

            {qrCodeStore.shouldShowSuccessContainer && (
              <div className="success-container">
                <div className="success-icon">✓</div>
                <p className="token-info">Authentication Token:</p>
                <div
                  className={`token-display ${
                    qrCodeStore.copied ? "copied" : ""
                  }`}
                  onClick={() => qrCodeStore.copyToken()}
                  title="Click to copy full token to clipboard"
                >
                  {qrCodeStore.truncatedToken}
                </div>
                {qrCodeStore.hasCallback && (
                  <p className="callback-info">
                    Redirecting to callback URL...
                  </p>
                )}
              </div>
            )}

            {(qrCodeStore.shouldShowRefreshButton ||
              qrCodeStore.canSimulateScan) && (
              <div className="button-container">
                {qrCodeStore.canSimulateScan && (
                  <button
                    onClick={() => qrCodeStore.simulateScan()}
                    className="scan-btn"
                  >
                    Scan QR Code (Simulate)
                  </button>
                )}
                {qrCodeStore.shouldShowRefreshButton && (
                  <button
                    onClick={() => qrCodeStore.fetchQRCode()}
                    className="refresh-btn"
                  >
                    Generate New QR Code
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="footer-links">
          <a href="/revoke" className="footer-link">
            Revoke Token
          </a>
        </div>
      </div>
    </div>
  );
});

export default App;
