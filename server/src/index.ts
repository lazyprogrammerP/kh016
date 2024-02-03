import express from "express";

const PORT = 8000 || process.env.PORT;
const server = express();

server.use(express.json());

server.listen(PORT, () => console.log(`server is listening on port: ${PORT}`));
