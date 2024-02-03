import dotenv from "dotenv";
import { assert } from "console";
import express from "express";
import jwt from "jsonwebtoken";
import srp from "secure-remote-password/server";
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

authRouter.post("/register", (req: express.Request<null, null, IRegisterRequest, null>, res: express.Response<SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.salt, "error: please provide the user's salt");
  assert(req.body.verifyingKey, "error: please provide the user's verifyingKey");

  const existingUser = users.find((user) => user.uid === req.body.uid);
  if (existingUser) {
    return res.status(400).send({ success: false, message: "error: user with this uid already exists" });
  }

  users.push({
    uid: req.body.uid,
    salt: req.body.salt,
    verifyingKey: req.body.verifyingKey,
  });

  return res.status(200).send({ success: true });
});

authRouter.post("/login", (req: express.Request<null, null, ILoginRequest, null>, res: express.Response<ILoginResponse | SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.clientEphermal.public, "error: please provide the client ephermal public");

  const userIndex = users.findIndex((user) => user.uid === req.body.uid);
  let user = users[userIndex];

  const serverEphermal = srp.generateEphemeral(user.verifyingKey);

  users[userIndex] = {
    ...users[userIndex],
    serverEphermal,
    clientEphermal: req.body.clientEphermal,
  };

  user = users[userIndex];
  if (user.serverEphermal?.public) {
    return res.status(200).send({ salt: users[userIndex].salt, serverEphermal: { public: user.serverEphermal.public } });
  }

  return res.status(400).send({ success: false, message: "error: server ephermal was not generated" });
});

authRouter.post("/verify", (req: express.Request<null, null, IVerifyRequest, null>, res: express.Response<SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.clientSession.proof, "error: please provide the client session proof");

  const userIndex = users.findIndex((user) => user.uid === req.body.uid);
  let user = users[userIndex];

  if (!user.serverEphermal?.secret || !user.clientEphermal?.public) {
    return res.status(400).send({ success: false, message: "error: login step was not completed" });
  }

  const serverSession = srp.deriveSession(user.serverEphermal.secret, user.clientEphermal.public, user.salt, user.uid, user.verifyingKey, req.body.clientSession.proof);
  if (req.body.clientSession.key === serverSession.key) {
    const jwtData = {
      userId: user.uid,
      createdAt: new Date(),
    };

    const accessToken = jwt.sign(jwtData, JWT_SECRET_KEY, { expiresIn: 3600 }); // 1 hour validity
    return res.status(200).send({ success: true, message: accessToken });
  }
});

authRouter.get("/validateToken", (req, res: express.Response<SuccessResponse>) => {
  try {
    const accessToken = req.header("authorization");

    if (!accessToken) {
      return res.status(403).send({ success: false, message: "error: please include an access token in the authorization header" });
    }

    const isValidJWT = jwt.verify(accessToken, JWT_SECRET_KEY);
    if (isValidJWT) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(401).send({ success: false, message: "error: jwt token has expired" });
    }
  } catch (error) {
    return res.status(401).send({ success: false, message: "error: jwt token is invalid" });
  }
});

export default authRouter;
