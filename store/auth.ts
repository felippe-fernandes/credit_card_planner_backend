import axiosInstance from "@/utils/axios";
import { create } from "zustand";

type User = { id: string; email: string } | null;

type AuthStore = {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(sessionStorage.getItem("user") || "null"),

  setUser: (user) => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
    set({ user });
  },

  logout: () => {
    sessionStorage.removeItem("user");
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const { data } = await axiosInstance.post("/api/auth/validate");

      if (!data) throw new Error("Invalid user");

      set({ user: data.user });
    } catch {
      sessionStorage.removeItem("user");
      set({ user: null });
    }
  },
}));
