import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { UserTypeModel } from "../models/UserTypeModel.js";

config();

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let token;

      // HEADER TOKEN
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // COOKIE TOKEN
      if (!token && req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({
          message: "Unauthorized. Please login",
        });
      }

      // VERIFY TOKEN
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ROLE CHECK
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(decoded.role)
      ) {
        return res.status(403).json({
          message: "Forbidden. Access denied",
        });
      }

      // USER CHECK
      const user = await UserTypeModel.findById(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(403).json({
          message: "User blocked or not found",
        });
      }

      req.user = decoded;

      next();
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  };
};