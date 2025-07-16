import express from "express";

import { config } from "dotenv";
config();

console.log("✅ ENV CHECK:");
console.log("TWILIO_SID:", process.env.TWILIO_SID);
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "[Present]" : "[Missing]");
console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER);
import cookieParser from "cookie-parser";

import cors from "cors"

import {connection} from "./database/dbConnection.js"
import { errorMiddleware } from "./middlewares/error.js";

import userRouter from "./routes/userRouter.js"

import passport from "passport";
import './config/passport-jwt-strategy.js'; 

export const app =express();

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods : ["GET","POST","PUT","DELETE"],
    credentials : true

})
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(passport.initialize())




app.use("/api/user", userRouter)
connection();
app.use(errorMiddleware)