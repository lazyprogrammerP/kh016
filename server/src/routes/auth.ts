import { assert } from "console";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import srp from "secure-remote-password/server";
import validateToken from "../middlewares/validateToken";
import prisma from "../prisma/index";
import User from "../types/generic/User";
import ILoginRequest from "../types/request/LoginRequest";
import IRegisterRequest from "../types/request/RegisterRequest";
import IVerifyRequest from "../types/request/VerifyRequest";
import ILoginResponse from "../types/response/LoginResponse";
import SuccessResponse from "../types/response/SuccessResponse";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error("error: JWT_SECRET_KEY not found in the environment variables");
}

// TODO: replace with a database
const users: Array<User> = [];

const authRouter = express.Router();

authRouter.post("/register", async (req: express.Request<null, SuccessResponse, IRegisterRequest, null>, res: express.Response<SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.salt, "error: please provide the user's salt");
  assert(req.body.verifyingKey, "error: please provide the user's verifyingKey");

  const existingUser = await prisma.user.findFirst({ where: { uid: req.body.uid } });
  if (existingUser) {
    return res.status(400).send({ success: false, message: "error: user with this uid already exists" });
  }

  await prisma.user.create({
    data: {
      uid: req.body.uid,
      salt: req.body.salt,
      verifyingKey: req.body.verifyingKey,
    },
  });

  return res.status(200).send({ success: true });
});

authRouter.post("/login", async (req: express.Request<null, ILoginResponse | SuccessResponse, ILoginRequest, null>, res: express.Response<ILoginResponse | SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.clientEphermal.public, "error: please provide the client ephermal public");

  let user = await prisma.user.findFirst({ where: { uid: req.body.uid } });
  if (!user) {
    return res.status(404).send({ success: false, message: "error: user with the given uid was not found" });
  }

  const serverEphermal = srp.generateEphemeral(user.verifyingKey);

  user = await prisma.user.update({
    where: { uid: user.uid },
    data: { serverEphermalPublic: serverEphermal.public, serverEphermalSecret: serverEphermal.secret, clientEphermalPublic: req.body.clientEphermal.public },
  });

  if (user.serverEphermalPublic) {
    return res.status(200).send({ salt: user.salt, serverEphermal: { public: user.serverEphermalPublic } });
  }

  return res.status(400).send({ success: false, message: "error: server ephermal was not generated" });
});

authRouter.post("/verify", async (req: express.Request<null, SuccessResponse, IVerifyRequest, null>, res: express.Response<SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.clientSession.proof, "error: please provide the client session proof");

  let user = await prisma.user.findFirst({ where: { uid: req.body.uid } });

  if (!user?.serverEphermalSecret || !user.clientEphermalPublic) {
    return res.status(400).send({ success: false, message: "error: login step was not completed" });
  }

  const serverSession = srp.deriveSession(user.serverEphermalSecret, user.clientEphermalPublic, user.salt, user.uid, user.verifyingKey, req.body.clientSession.proof);
  if (req.body.clientSession.key === serverSession.key) {
    const jwtData = {
      userId: user.uid,
      createdAt: new Date(),
    };

    const accessToken = jwt.sign(jwtData, JWT_SECRET_KEY, { expiresIn: 3600 }); // 1 hour validity
    return res.status(200).send({ success: true, message: accessToken });
  }

  return res.status(401).send({ success: false, message: "error: invalid credentials :)" });
});

authRouter.get("/validateToken", validateToken, (req: express.Request, res: express.Response) => {
  return res.status(200).send({ success: true });
});

export default authRouter;
