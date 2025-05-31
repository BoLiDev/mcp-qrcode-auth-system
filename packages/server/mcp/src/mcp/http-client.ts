import axios, { AxiosResponse } from 'axios';

import { GitLabApiResponse } from './types';

export class HttpClient {
  private readonly timeout: number;

  constructor(timeout: number = 30000) {
    this.timeout = timeout;
  }

  public async get<T>(
    url: string,
    headers: Record<string, string> = {}
  ): Promise<GitLabApiResponse<T>> {
    try {
      console.error(`Making GET request to: ${url}`);

      const response: AxiosResponse<T> = await axios.get(url, {
        decompress: false,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: this.timeout,
      });

      console.error(
        `Response headers: ${JSON.stringify(response.headers, null, 2)}`
      );

      return this.transformResponse(response);
    } catch (error) {
      throw this.handleError(error, url);
    }
  }

  public async post<T>(
    url: string,
    data?: unknown,
    headers: Record<string, string> = {}
  ): Promise<GitLabApiResponse<T>> {
    try {
      console.error(`Making POST request to: ${url}`);
      if (data) {
        console.error(`Request body length: ${JSON.stringify(data).length}`);
      }

      const response: AxiosResponse<T> = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: this.timeout,
      });

      console.error(
        `Response received: ${response.status} ${response.statusText}`
      );
      console.error(`Response data type: ${typeof response.data}`);

      return this.transformResponse(response);
    } catch (error) {
      throw this.handleError(error, url);
    }
  }

  private transformResponse<T>(
    response: AxiosResponse<T>
  ): GitLabApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  private handleError(error: unknown, url: string): Error {
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        return new Error(`HTTP ${status}: ${JSON.stringify(data)}`);
      } else if (error.request) {
        // Request was made but no response received
        return new Error(`No response received from ${url}: ${error.message}`);
      } else {
        // Something else happened
        return new Error(`Request setup error for ${url}: ${error.message}`);
      }
    }

    return new Error(`Unknown error for ${url}: ${String(error)}`);
  }
}
