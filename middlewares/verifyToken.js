import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { UserTypeModel } from "../models/UserTypeModel.js";

config();

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let token;

      // 1. Check Authorization Header
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // 2. Check Cookie Token
      if (!token && req.cookies.token) {
        token = req.cookies.token;
      }

      // 3. No token
      if (!token) {
        return res.status(401).json({
          message: "Unauthorized. Please login",
        });
      }

      // 4. Verify JWT
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // 5. Role validation
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(decodedToken.role)
      ) {
        return res.status(403).json({
          message: "Forbidden. Access denied",
        });
      }

      // 6. Check user exists
      const user = await UserTypeModel.findById(
        decodedToken.userId
      );

      if (!user || !user.isActive) {
        return res.status(403).json({
          message: "User account inactive or deleted",
        });
      }

      // 7. Attach user
      req.user = decodedToken;

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Session expired. Login again",
        });
      }

      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token",
        });
      }

      return res.status(500).json({
        message: "Server error",
      });
    }
  };
};
// authenticate user
userRoute.post("/authenticate", async (req, res, next) => {
  try {
    let userCred = req.body;

    // call authenticate service
    let { token, user } = await authenticate(userCred);

    // save token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "login success",
      token,
      payload: user,
    });
  } catch (err) {
    next(err);
  }
});