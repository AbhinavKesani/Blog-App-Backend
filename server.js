import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { userRoute } from "./APIs/UserAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { adminRoute } from "./APIs/AdminAPI.js";
import { commonRouter } from "./APIs/CommanAPI.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

/* =========================
   STEP 1: CORS SETUP
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://blog-app-frontend-three-theta.vercel.app"
    ],
    credentials: true
  })
);

// IMPORTANT: Handle preflight requests
app.options("*", cors());

/* =========================
   STEP 2: MIDDLEWARES
========================= */
app.use(express.json());
app.use(cookieParser());

/* =========================
   STEP 3: ROUTES
========================= */
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

/* =========================
   STEP 4: TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* =========================
   STEP 5: DATABASE + SERVER
========================= */
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected successfully");
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });