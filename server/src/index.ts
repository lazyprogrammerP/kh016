import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRouter from "./routes/auth";

dotenv.config();

const PORT = process.env.PORT || 8000;
const server = express();

server.use(cors());
server.use(express.json());

server.use("/api/v1/auth", authRouter);

server.listen(PORT, () => console.log(`server is listening on port: ${PORT}`));
