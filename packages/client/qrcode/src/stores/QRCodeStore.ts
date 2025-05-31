/** @format */

import { makeAutoObservable } from "mobx";

interface QRCodeResponse {
  success: boolean;
  data: {
    sessionId: string;
    qrcode: string;
    scanUrl: string;
    expiresAt: number;
  };
}

interface StatusResponse {
  success: boolean;
  data: {
    status: "pending" | "authenticated" | "expired";
    expiresAt: number;
    token?: string;
  };
}

export class QRCodeStore {
  qrcode: string = "";
  loading: boolean = true;
  error: string = "";
  authStatus: "pending" | "authenticated" | "expired" = "pending";
  token: string = "";
  copied: boolean = false;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private currentSessionId: string = "";
  private copyTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private callbackUrl: string = "";

  constructor() {
    makeAutoObservable(this);
    this.initializeFromUrl();
  }

  private initializeFromUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const callback = urlParams.get("callback");

    if (callback) {
      this.callbackUrl = decodeURIComponent(callback);
    }
  }

  public async fetchQRCode(): Promise<void> {
    try {
      this.loading = true;
      this.error = "";
      this.authStatus = "pending";
      this.token = "";

      this.clearPolling();

      const response = await fetch("/api/qrcode");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QRCodeResponse = await response.json();

      if (data.success) {
        this.qrcode = data.data.qrcode;
        this.currentSessionId = data.data.sessionId;
        this.startPolling(data.data.sessionId);
      } else {
        throw new Error("Failed to generate QR code");
      }
    } catch (err) {
      this.error =
        err instanceof Error ? err.message : "Unknown error occurred";
    } finally {
      this.loading = false;
    }
  }

  public cleanup(): void {
    this.clearPolling();
    if (this.copyTimeoutId) {
      clearTimeout(this.copyTimeoutId);
      this.copyTimeoutId = null;
    }
  }

  public get statusMessage(): string {
    switch (this.authStatus) {
      case "pending":
        return "Waiting for authentication...";
      case "authenticated":
        return "Authentication successful!";
      case "expired":
        return "QR code has expired. Please generate a new one.";
      default:
        return "";
    }
  }

  public get statusColor(): string {
    switch (this.authStatus) {
      case "pending":
        return "#666";
      case "authenticated":
        return "#27ae60";
      case "expired":
        return "#e74c3c";
      default:
        return "#666";
    }
  }

  public get shouldShowQRCode(): boolean {
    return this.authStatus !== "authenticated";
  }

  public get shouldShowPollingIndicator(): boolean {
    return this.authStatus === "pending";
  }

  public get shouldShowSuccessContainer(): boolean {
    return this.authStatus === "authenticated" && !!this.token;
  }

  public get shouldShowRefreshButton(): boolean {
    return this.authStatus === "expired" || this.authStatus === "authenticated";
  }

  public get truncatedToken(): string {
    return this.token ? `${this.token.substring(0, 20)}...` : "";
  }

  public get canSimulateScan(): boolean {
    return this.authStatus === "pending" && !!this.currentSessionId;
  }

  public get hasCallback(): boolean {
    return !!this.callbackUrl;
  }

  public async simulateScan(): Promise<void> {
    if (!this.currentSessionId) {
      console.error("No session ID available for simulation");
      return;
    }

    try {
      const response = await fetch(`/api/auth/scan/${this.currentSessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceInfo: "Simulated Device - Browser",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("Scan simulation successful:", data.message);
      } else {
        console.error("Scan simulation failed:", data.message);
      }
    } catch (err) {
      console.error("Failed to simulate scan:", err);
    }
  }

  public async copyToken(): Promise<void> {
    if (!this.token) {
      console.error("No token available to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(this.token);
      console.log("Token copied to clipboard");
      this.copied = true;
      this.copyTimeoutId = setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy token:", err);
      // Fallback for older browsers
      this.fallbackCopyToken();
    }
  }

  private fallbackCopyToken(): void {
    if (!this.token) return;

    const textArea = document.createElement("textarea");
    textArea.value = this.token;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      console.log("Token copied to clipboard (fallback)");
      this.copied = true;
      this.copyTimeoutId = setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }

    document.body.removeChild(textArea);
  }

  private async checkAuthStatus(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/qrcode/status/${sessionId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StatusResponse = await response.json();

      if (data.success) {
        this.authStatus = data.data.status;

        if (data.data.status === "authenticated" && data.data.token) {
          this.token = data.data.token;
          this.clearPolling();

          // Execute callback with authCode if callback URL is provided
          if (this.callbackUrl) {
            this.executeCallback(data.data.token);
          }
        } else if (data.data.status === "expired") {
          this.clearPolling();
        }
      }
    } catch (err) {
      console.error("Failed to check auth status:", err);
    }
  }

  private executeCallback(authCode: string): void {
    try {
      const callbackUrlWithParams = `${this.callbackUrl}${
        this.callbackUrl.includes("?") ? "&" : "?"
      }authCode=${encodeURIComponent(authCode)}`;

      console.log("Executing callback:", callbackUrlWithParams);

      // Execute callback by redirecting to the callback URL
      window.location.href = callbackUrlWithParams;
    } catch (err) {
      console.error("Failed to execute callback:", err);
    }
  }

  private startPolling(sessionId: string): void {
    this.pollingTimer = setInterval(() => {
      this.checkAuthStatus(sessionId);
    }, 3000);
  }

  private clearPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}
