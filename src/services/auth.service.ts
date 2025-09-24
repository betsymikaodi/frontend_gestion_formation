import { API_HEADERS, API_ROUTES } from '@/config/api';

export interface LoginResponse {
  token: string;
  role: 'ADMIN' | 'USER' | string;
  nomComplet?: string;
}

export const AuthService = {
  async login(email: string, motDePasse: string): Promise<LoginResponse> {
    const res = await fetch(API_ROUTES.auth.login, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ email, motDePasse }),
    });
    if (!res.ok) {
      throw new Error(`Login failed: ${res.status}`);
    }
    return res.json();
  },

  async register(payload: { email: string; motDePasse: string; prenom?: string; nom?: string; role?: 'ADMIN' | 'USER' | string; }): Promise<Response> {
    return fetch(API_ROUTES.auth.register, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(payload),
    });
  },
};
