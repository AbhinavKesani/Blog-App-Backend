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

/* CORS */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

/* Extra headers for cookies */
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Credentials",
    "true"
  );

  res.header(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  next();
});

/* Body parser */
app.use(exp.json());

/* Cookie parser */
app.use(cookieParser());

/* Routes */
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

/* DB connection */
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);

    console.log("DB connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(
        `Server running on port ${process.env.PORT}`
      );
    });
  } catch (err) {
    console.log(
      "DB connection failed:",
      err.message
    );
  }
};

connectDB();

/* Invalid route handler */
app.use((req, res) => {
  res.status(404).json({
    message: `${req.url} is invalid path`,
  });
});

/* Global error handler */
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