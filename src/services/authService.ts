import apiClient from './api';

interface SendCodeRequest {
  phoneNumber: string;
}

interface VerifyCodeRequest {
  phoneNumber: string;
  verificationCode: string;
}

interface LoginRequest {
  phoneNumber: string;
  code: string;
}

interface SignupRequest {
  phoneNumber: string;
  code: string;
  nickname: string;
  email: string;
  password: string;
  profileImageUrl?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    phoneNumber: string;
    nickname: string;
    profileImageUrl?: string;
  };
}

export const authService = {
  sendCode: async (data: SendCodeRequest) => {
    const response = await apiClient.post('/auth/send-code', data);
    return response.data;
  },

  verifyCode: async (data: VerifyCodeRequest) => {
    const response = await apiClient.post('/auth/verify-code', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },
};