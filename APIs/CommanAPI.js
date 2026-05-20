import exp from "express";
import { authenticate } from "../Services/authService.js";
import { UserTypeModel } from "../models/UserTypeModel.js";
import { compare, hash } from "bcryptjs";
import { verifyToken } from "../middlewares/verifyToken.js";

export const commonRouter = exp.Router();

/* LOGIN */
commonRouter.post("/login", async (req, res, next) => {
  try {
    const { token, user } = await authenticate(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // change to true only in HTTPS production with same-site none
    });

    res.status(200).json({
      message: "login success",
      payload: user,
    });
  } catch (err) {
    next(err);
  }
});

/* CHECK AUTH */
commonRouter.get(
  "/check-auth",
  verifyToken("ADMIN", "USER", "AUTHOR"),
  (req, res) => {
    res.status(200).json({
      message: "Authenticated",
      payload: req.user,
    });
  }
);

/* LOGOUT */
commonRouter.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.status(200).json({
    message: "logged out successfully",
  });
});

/* CHANGE PASSWORD */
commonRouter.put("/change-password", async (req, res, next) => {
  try {
    const { email, currentPass, newPass } = req.body;

    const userDoc = await UserTypeModel.findOne({ email });

    if (!userDoc) {
      return res.status(404).json({ message: "invalid email" });
    }

    const isMatch = await compare(currentPass, userDoc.password);

    if (!isMatch) {
      return res.status(400).json({ message: "incorrect password" });
    }

    const hashedPassword = await hash(newPass, 10);

    userDoc.password = hashedPassword;
    await userDoc.save();

    res.status(200).json({
      message: "password updated successfully",
    });
  } catch (err) {
    next(err);
  }
});