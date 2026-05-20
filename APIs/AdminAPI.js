import exp from "express";
import { UserTypeModel } from "../models/UserTypeModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const adminRoute = exp.Router();

/* BLOCK USER */
adminRoute.put(
  "/users/block",
  verifyToken("ADMIN"),
  async (req, res, next) => {
    try {
      const { user } = req.body;

      const userDoc = await UserTypeModel.findById(user);

      if (!userDoc) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      userDoc.isActive = false;
      await userDoc.save();

      res.status(200).json({
        message: "User blocked successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

/* UNBLOCK USER */
adminRoute.put(
  "/users/unblock",
  verifyToken("ADMIN"),
  async (req, res, next) => {
    try {
      const { user } = req.body;

      const userDoc = await UserTypeModel.findById(user);

      if (!userDoc) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      userDoc.isActive = true;
      await userDoc.save();

      res.status(200).json({
        message: "User unblocked successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);