import express from "express";
import router from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://aitreasurer-frontend.onrender.com",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api", router);
