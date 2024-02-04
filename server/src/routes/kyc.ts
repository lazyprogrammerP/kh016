import { spawn } from "child_process";
import { assert } from "console";
import express from "express";
import fs from "fs";
import validateToken from "../middlewares/validateToken";
import prisma from "../prisma";
import IKYCCredentialsRequest from "../types/request/KYCCredentialsRequest";
import IKYCVerifyRequest from "../types/request/KYCVerifyRequest";
import IKYCCredentialsResponse from "../types/response/KYCCredentialsResponse";
import SuccessResponse from "../types/response/SuccessResponse";

const kycRouter = express.Router();

kycRouter.post(`/credentials`, validateToken, async (req: express.Request<null, IKYCCredentialsResponse, IKYCCredentialsRequest, null>, res: express.Response<IKYCCredentialsResponse | SuccessResponse>) => {
  assert(req.body.ageRestriction, "error: please provide the ageRestriction criteria");
  assert(req.body.countryRestriction, "error: please provide the countryRestriction criteria");

  // TODO: add a third-part API that can verify this information

  fs.writeFileSync("circuits/zk-age-constraint/input.json", JSON.stringify(req.body.ageRestriction));
  await new Promise((resolve) => {
    const keygen = spawn(
      "bash",
      [
        "-c",
        `cd circuits/zk-age-constraint/circuit_js && \
    node generate_witness.js circuit.wasm ../input.json witness.wtns && \
    cd ../ && \
    npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v && \
    npx snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey && \
    npx snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="Parshva Runwal" -v && \
    npx snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json && \
    npx snarkjs groth16 prove circuit_0001.zkey ./circuit_js/witness.wtns proof.json public.json`,
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    keygen.stdout.on("data", (data) => {
      if (data.includes("Enter a random text. (Entropy):")) {
        keygen.stdin.write("low entropy\n");
      }
    });

    keygen.on("close", (code) => {
      resolve("OK");
    });
  });

  const ageVerificationJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/verification_key.json", "utf8"));
  const ageProofJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/proof.json", "utf8"));
  const agePublicJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/public.json", "utf8"));

  fs.writeFileSync("circuits/zk-country-constraint/input.json", JSON.stringify(req.body.countryRestriction));
  await new Promise((resolve) => {
    const keygen = spawn(
      "bash",
      [
        "-c",
        `cd circuits/zk-country-constraint/circuit_js && \
    node generate_witness.js circuit.wasm ../input.json witness.wtns && \
    cd ../ && \
    npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v && \
    npx snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey && \
    npx snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="Parshva Runwal" -v && \
    npx snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json && \
    npx snarkjs groth16 prove circuit_0001.zkey ./circuit_js/witness.wtns proof.json public.json`,
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    keygen.stdout.on("data", (data) => {
      if (data.includes("Enter a random text. (Entropy):")) {
        keygen.stdin.write("low entropy\n");
      }
    });

    keygen.on("close", (code) => {
      resolve("OK");
    });
  });

  const countryVerificationJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/verification_key.json", "utf8"));
  const countryProofJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/proof.json", "utf8"));
  const countryPublicJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/public.json", "utf8"));

  const userId = req.cookies["user-id"];
  await prisma.user.update({
    where: { uid: userId },
    data: {
      ageVerificationJSON: ageVerificationJSON,
      agePublicJSON: agePublicJSON,
      countryVerificationJSON: countryVerificationJSON,
      countryPublicJSON: countryPublicJSON,
    },
  });

  return res.status(200).send({ ageProofJSON, countryProofJSON });
});

kycRouter.post(`/verify`, validateToken, async (req: express.Request<null, IKYCCredentialsResponse, IKYCVerifyRequest, null>, res: express.Response<IKYCCredentialsResponse | SuccessResponse>) => {
  assert(req.body.ageProofJSON, "error: please provide the ageRestriction criteria");
  assert(req.body.countryProofJSON, "error: please provide the countryRestriction criteria");

  // TODO: add a third-part API that can verify this information

  const userId = req.cookies["user-id"];
  let user = await prisma.user.findFirst({ where: { uid: userId } });

  if (!user?.ageVerificationJSON || !user?.agePublicJSON) {
    return res.status(400).send({ success: false, message: "error: cannot find user credentials" });
  }

  if (!user?.countryVerificationJSON || !user?.countryPublicJSON) {
    return res.status(400).send({ success: false, message: "error: cannot find user credentials" });
  }

  fs.writeFileSync("circuits/zk-age-constraint/verification.json", JSON.stringify(user.ageVerificationJSON));
  fs.writeFileSync("circuits/zk-age-constraint/proof.json", JSON.stringify(req.body.ageProofJSON));
  fs.writeFileSync("circuits/zk-age-constraint/public.json", JSON.stringify(user.agePublicJSON));

  await new Promise((resolve) => {
    const keygen = spawn(
      "bash",
      [
        "-c",
        `cd circuits/zk-age-constraint && \
      npx snarkjs groth16 verify verification_key.json public.json proof.json`,
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    keygen.on("close", (code) => {
      console.log("Code: ", code);
    });
  });

  return res.status(200).send({ success: true, message: "CHANGE THIS NOW." });
});

export default kycRouter;
