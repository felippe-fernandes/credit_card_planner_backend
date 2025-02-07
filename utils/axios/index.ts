import { IErrorResponse } from "@/types/auth";
import axios from "axios";

const axiosInstance = axios.create({
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;

export async function handleRequest<T>(
  request: Promise<{ data: T }>,
  errorMessage?: string
): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (ex: unknown) {
    const serverError = ex as IErrorResponse;
    throw new Error(serverError.message || errorMessage || "Internal Error");
  }
}
