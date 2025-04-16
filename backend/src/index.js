import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from 'url';

import path from "path";


import {connectDB} from "./lib/db.js";
import authRoutes from "./routes/auth_route.js";
import messageRoutes from "./routes/message_route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




// Middleware to parse JSON request bodies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());


app.use(cors({
    origin: "https://auth.localhost",
    credentials:true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// health check route
app.get("/", (req, res) => {
    res.send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV ==="production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*",(req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}


server.listen(PORT, () => {
    console.log("server is running on PORT:", + PORT);
    connectDB();
});

