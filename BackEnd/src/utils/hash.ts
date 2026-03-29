import crypto from "crypto";

export const hashToken = (token: string): string => { // gera um hash SHA-256 do token 
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};