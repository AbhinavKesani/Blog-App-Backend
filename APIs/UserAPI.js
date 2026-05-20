import express from "express";
import { UserTypeModel } from "../models/UserTypeModel.js";
import bcrypt from "bcryptjs";

export const userRoute = express.Router();

/* =========================
   REGISTER USER
========================= */
userRoute.post("/users", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // check missing fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // check existing user
    const existingUser = await UserTypeModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await UserTypeModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      payload: newUser,
    });
  } catch (err) {
    next(err);
  }
});