import { assert } from "console";
import express from "express";
import SuccessResponse from "./types/response/SuccessResponse";
import User from "./types/generic/User";
import IRegisterRequest from "./types/request/RegisterRequest";
import ILoginRequest from "./types/request/LoginRequest";
import srp from "secure-remote-password/server";
import ILoginResponse from "./types/response/LoginResponse";
import IVerifyRequest from "./types/request/VerifyRequest";

const PORT = 8000 || process.env.PORT;
const server = express();

// TODO: replace with a database
const users: Array<User> = [];

server.use(express.json());

server.post("/register", (req: express.Request<null, null, IRegisterRequest, null>, res: express.Response<SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.salt, "error: please provide the user's salt");
  assert(req.body.verifyingKey, "error: please provide the user's verifyingKey");

  users.push({
    uid: req.body.uid,
    salt: req.body.salt,
    verifyingKey: req.body.verifyingKey,
  });

  return res.send({ success: true });
});

server.post("/login", (req: express.Request<null, null, ILoginRequest, null>, res: express.Response<ILoginResponse | SuccessResponse>) => {
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
    return res.send({ salt: users[userIndex].salt, serverEphermal: { public: user.serverEphermal.public } });
  }

  return res.send({ success: false, message: "error: server ephermal was not generated" });
});

server.post("/verify", (req: express.Request<null, null, IVerifyRequest, null>, res: express.Response<SuccessResponse>) => {
  assert(req.body.uid, "error: please provide the user uid");
  assert(req.body.clientSession.proof, "error: please provide the client session proof");

  const userIndex = users.findIndex((user) => user.uid === req.body.uid);
  let user = users[userIndex];

  if (!user.serverEphermal?.secret || !user.clientEphermal?.public) {
    return res.send({ success: false, message: "error: login step was not completed" });
  }

  const serverSession = srp.deriveSession(user.serverEphermal.secret, user.clientEphermal.public, user.salt, user.uid, user.verifyingKey, req.body.clientSession.proof);
  if (req.body.clientSession.key === serverSession.key) {
    return res.send({ success: true, message: "authenticated successfully! the client can now start oerfirming actions" });
  }
});

server.listen(PORT, () => console.log(`server is listening on port: ${PORT}`));
