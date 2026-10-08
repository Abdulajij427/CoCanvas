import { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import  JWT_SECRET  from "@repo/backend-common";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];   // space se split

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).userId = decoded.id;   // token me key "id" hai (generateToken: {id})
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}