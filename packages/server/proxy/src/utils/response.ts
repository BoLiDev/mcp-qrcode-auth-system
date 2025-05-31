export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ResponseHelper {
  static success<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string): ApiResponse {
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }

  static formatLogMessage(
    method: string,
    url: string,
    statusCode?: number
  ): string {
    const timestamp = new Date().toISOString();
    if (statusCode) {
      return `[${timestamp}] ${method} ${url} - ${statusCode}`;
    }
    return `[${timestamp}] ${method} ${url}`;
  }
}
