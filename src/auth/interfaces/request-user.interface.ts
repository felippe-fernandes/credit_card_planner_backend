export interface UserRequestInfo {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  token: string;
}

export interface RequestWithUser extends Request {
  user: UserRequestInfo;
}
