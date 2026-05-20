import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import { userRoute } from "./APIs/UserAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { adminRoute } from "./APIs/AdminAPI.js";
import cookieParser from "cookie-parser";
import { commonRouter } from "./APIs/CommanAPI.js";
import cors from "cors";

config();

const app = exp();

/* ✅ FIXED CORS (PRODUCTION SAFE) */
app.use(
  cors({
    origin: "https://blog-app-frontend-three-theta.vercel.app",
    credentials: true,
  })
);

/* optional but IMPORTANT for cookies in some cases */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "https://blog-app-frontend-three-theta.vercel.app");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// body parser
app.use(exp.json());
app.use(cookieParser());

// routes
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

// DB connection
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB connected successfully");

    app.listen(process.env.PORT, () =>
      console.log("Server started")
    );
  } catch (err) {
    console.log("DB connection failed", err);
  }
};

connectDB();

// invalid route handler
app.use((req, res) => {
  res.status(404).json({ message: `${req.url} is invalid path` });
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "duplicate error",
      error: err.keyValue,
    });
  }

  res.status(500).json({
    message: "Server error",
  });
});