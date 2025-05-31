interface RequestInfo {
  method: string;
  url: string;
  sessionId?: string;
  timestamp?: string;
}

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const formatMethod = (method: string): string => {
  const colors = {
    GET: '\x1b[32m', // Green
    POST: '\x1b[33m', // Yellow
    PUT: '\x1b[34m', // Blue
    DELETE: '\x1b[31m', // Red
  };
  const reset = '\x1b[0m';
  const color = colors[method as keyof typeof colors] || '\x1b[37m'; // White
  return `${color}${method.padEnd(6)}${reset}`;
};

export const printRequest = (info: RequestInfo): void => {
  const timestamp = info.timestamp || formatTimestamp();
  const method = formatMethod(info.method);
  const sessionInfo = info.sessionId
    ? ` [Session: ${info.sessionId.slice(0, 8)}...]`
    : '';

  console.log(`🌐 ${timestamp} ${method} ${info.url}${sessionInfo}`);
};

export const printQRCodeGeneration = (): void => {
  console.log('📱 QR Code generated successfully');
};

export const printStatusQuery = (sessionId: string, status: string): void => {
  console.log(
    `🔍 Status query for session ${sessionId.slice(0, 8)}... → ${status}`
  );
};

export const printSessionExpired = (sessionId: string): void => {
  console.log(`⏰ Session ${sessionId.slice(0, 8)}... expired`);
};

export const printTokenGenerated = (
  sessionId: string,
  deviceInfo?: string
): void => {
  const deviceText = deviceInfo ? ` from device: ${deviceInfo}` : '';
  console.log(
    `🔐 Token generated for session ${sessionId.slice(0, 8)}...${deviceText}`
  );
};

export const printScanSuccess = (sessionId: string): void => {
  console.log(
    `✅ Scan authentication successful for session ${sessionId.slice(0, 8)}...`
  );
};

export const printError = (operation: string, error: string): void => {
  console.log(`❌ ${operation} failed: ${error}`);
};
