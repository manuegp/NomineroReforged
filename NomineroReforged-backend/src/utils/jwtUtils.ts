import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export function generateToken(user: User & { department_id?: number }): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname,
    is_admin: user.is_admin,
    is_superadmin: user.is_superadmin,
    department_id: user.department_id, // Agregar department_id al token
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export function getUserIdFromToken(token: string): number {
  const cleanToken = token.split(" ")[1];
  const verifiedToken = verifyToken(cleanToken);
  return verifiedToken.id;
}

export function getRolFromToken(token: string): string {
  const cleanToken = token.split(" ")[1];
  const verifiedToken = verifyToken(cleanToken);
  if (verifiedToken.is_superadmin == 1 ) {
    return "super_admin";
  } else if (verifiedToken.is_admin == 1) {
    return "admin";
  } else {
    return "empleado";
  }
}
export function getDepartmentFromToken(token: string): number {
  const cleanToken = token.split(" ")[1];
  const verifiedToken = verifyToken(cleanToken);
  return verifiedToken.department_id
}
