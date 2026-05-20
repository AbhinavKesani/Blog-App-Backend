import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";

import { userRoute } from "./APIs/UserAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { adminRoute } from "./APIs/AdminAPI.js";
import { commonRouter } from "./APIs/CommanAPI.js";

import cookieParser from "cookie-parser";
import cors from "cors";

config();

const app = exp();

/* PORT FIX (IMPORTANT FOR RENDER) */
const PORT = process.env.PORT || 10000;

/* FRONTEND URL SAFE CHECK */
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://blog-app-frontend-three-theta.vercel.app";

/* CORS */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

/* Headers */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

/* Body parser */
app.use(exp.json());

/* Cookies */
app.use(cookieParser());

/* Routes */
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

/* TEST ROUTE (helps debugging) */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* DB + SERVER START */
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);

    console.log("DB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("DB connection failed:", err.message);
    process.exit(1); // IMPORTANT: fail clearly instead of silent crash
  }
};

connectDB();

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({
    message: `${req.url} is invalid path`,
  });
});

/* Error handler */
app.use((err, req, res, next) => {
  console.log(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      error: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID",
      error: err.message,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate key error",
      error: err.keyValue,
    });
  }

  return res.status(500).json({
    message: "Internal Server Error",
  });
});