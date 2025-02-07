import {
  IAuthFields,
  IMessageResponse,
  IUserResponse,
  IValidateSessionResponse,
} from "@/types/auth";
import axiosInstance, { handleRequest } from "@/utils/axios";

export const SignInWithPassword = async ({
  email,
  password,
}: IAuthFields): Promise<IUserResponse> => {
  return handleRequest(
    axiosInstance.post<IUserResponse>("/api/auth/login", { email, password })
  );
};

export const SignUp = async ({
  email,
  password,
  name,
}: IAuthFields): Promise<IMessageResponse> => {
  return handleRequest(
    axiosInstance.post<IMessageResponse>("/api/auth/signup", {
      email,
      password,
      name,
    })
  );
};

export const SignOut = async (): Promise<IMessageResponse> => {
  return handleRequest(
    axiosInstance.post<IMessageResponse>("/api/auth/signout")
  );
};

export const Validate = async (): Promise<IValidateSessionResponse> => {
  return handleRequest(
    axiosInstance.post<IValidateSessionResponse>("/api/auth/validate")
  );
};
