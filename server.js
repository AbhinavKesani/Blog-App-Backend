import exp from "express";
import { connect } from "mongoose";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { userRoute } from "./APIs/UserAPI.js";
import { authorRoute } from "./APIs/AuthorAPI.js";
import { adminRoute } from "./APIs/AdminAPI.js";
import { commonRouter } from "./APIs/CommanAPI.js";

config();

const app = exp();
const PORT = process.env.PORT || 10000;

/* STEP 1: CORS (VERY IMPORTANT) */
app.use(
cors({
  origin: [
    "http://localhost:5173",
    "https://blog-app-frontend-bkvxckr56-abhinav-kesani-s-projects.vercel.app"
  ],
  credentials: true
})
);

/* STEP 2: MIDDLEWARES */
app.use(exp.json());
app.use(cookieParser());

/* STEP 3: ROUTES */
app.use("/user-api", userRoute);
app.use("/author-api", authorRoute);
app.use("/admin-api", adminRoute);
app.use("/common-api", commonRouter);

/* STEP 4: TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* STEP 5: DATABASE + SERVER START */
connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected");
    app.listen(PORT, () =>
      console.log("Server running on", PORT)
    );
  })
  .catch((err) => {
    console.log("DB error", err);
  });