// features/auth/hooks/useAuth.ts
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { token, user, setToken, setUser, logout, login, isAuthReady } =
    useAuthStore();

  return {
    token,
    user,
    setToken,
    setUser,
    logout,
    login,
    isAuthReady,
  };
};
