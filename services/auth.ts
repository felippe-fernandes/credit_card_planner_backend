import { IAuthFields } from "@/types/auth";
import axios from "axios";

export const SignInWithPassword = async ({ email, password }: IAuthFields) => {
  try {
    const response = await axios.post("/api/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch {
    throw new Error("Login failed");
  }
};

export const SignUp = async ({ email, password, name }: IAuthFields) => {
  try {
    const response = await axios.post("/api/auth/signup", {
      email,
      password,
      name,
    });

    return response.data;
  } catch {
    throw new Error("Signup failed");
  }
};

export const SignOut = async () => {
  try {
    const response = await axios.post("/api/auth/signout");

    return response.data;
  } catch {
    throw new Error("Signout failed");
  }
};
