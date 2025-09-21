export interface ApiError {
  status: number;
  message: string;
  details?: string;
  timestamp?: string;
  path?: string;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};