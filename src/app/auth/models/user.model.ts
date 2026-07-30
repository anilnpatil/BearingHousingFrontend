/** User Model */
export interface User {
  id?: number;
  username: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
  updatedAt?: string;
}

/** API Response wrapper for consistency */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  count?: number;
}

/** Register Request DTO */
export interface RegisterRequest {
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

/** Auth Request DTO (Login) */
export interface AuthRequest {
  username: string;
  password: string;
}

/** Login Response */
export interface LoginResponse {
  token: string;
}
