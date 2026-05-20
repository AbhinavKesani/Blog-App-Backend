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

/* PORT */
const PORT = process.env.PORT || 10000;

/* ALLOWED ORIGINS */
const allowedOrigins = [
  "http://localhost:5173",
  "https://blog-app-frontend-three-theta.vercel.app",
];

/* CORS */
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* Headers (IMPORTANT FIX) */
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  next();
});

/* Body parser */
app.use(exp.json());
app.use(cookieParser());

/* Routes */
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

/* Health check */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* DB + SERVER */
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);

    console.log("DB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("DB connection failed:", err.message);
    process.exit(1);
  }
};

connectDB();

/* 404 */
app.use((req, res) => {
  res.status(404).json({
    message: `${req.url} is invalid path`,
  });
});

/* Error handler */
app.use((err, req, res, next) => {
  console.log(err);

  return res.status(500).json({
    message: "Internal Server Error",
  });
});