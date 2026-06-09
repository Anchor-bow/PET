import { apiClient } from './client';

interface LoginResponse {
  accessToken: string;
}

export function login(email: string, password: string) {
  return apiClient.post<LoginResponse>('/auth/login', { email, password });
}
