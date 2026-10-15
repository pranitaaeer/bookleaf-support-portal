
import jwt from 'jsonwebtoken'

 export function createToken(id: string, role: "author" | "admin") {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables");
  }

  return jwt.sign({ id, role }, secret, { expiresIn: "1d" });
}