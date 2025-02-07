import { Session } from "@supabase/supabase-js";

export interface IAuthFields {
  email: string;
  password: string;
  name?: string;
}

export interface IErrorResponse {
  message: string;
}

export interface IMessageResponse {
  message: string;
}

export interface IUserResponse {
  user: Session["user"];
}

export interface IValidateSessionResponse
  extends IMessageResponse,
    IUserResponse {
  authenticated: boolean;
}
