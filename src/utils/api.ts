const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface LoginData {
  username: string;
  password: string;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
}

class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(errorData.detail || "Login failed", response.status);
    }

    return response.json();
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.detail || "Registration failed",
        response.status
      );
    }

    return response.json();
  },

  async getProfile(): Promise<UserProfile> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.detail || "Failed to fetch profile",
        response.status
      );
    }

    return response.json();
  },

  async updateProfile(email?: string): Promise<UserProfile> {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type") || "bearer";

    if (!token) {
      throw new ApiError("No authentication token found", 401);
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: {
        Authorization: `${tokenType} ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(
        errorData.detail || "Failed to update profile",
        response.status
      );
    }

    return response.json();
  },
};

export const tokenUtils = {
  getToken(): string | null {
    return localStorage.getItem("access_token");
  },

  setToken(token: string, tokenType: string = "bearer"): void {
    localStorage.setItem("access_token", token);
    localStorage.setItem("token_type", tokenType);
  },

  removeToken(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
