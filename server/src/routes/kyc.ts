import { spawn } from "child_process";
import { assert } from "console";
import express from "express";
import fs from "fs";
import validateToken from "../middlewares/validateToken";
import prisma from "../prisma";
import IKYCApproveRequest from "../types/request/KYCApproveRequest";
import IKYCCredentialsRequest from "../types/request/KYCCredentialsRequest";
import IKYCRequest from "../types/request/KYCRequest";
import IKYCCredentialsResponse from "../types/response/KYCCredentialsResponse";
import IKYCRequestResponse from "../types/response/KYCRequestResponse";
import SuccessResponse from "../types/response/SuccessResponse";

const kycRouter = express.Router();

const whitelistedOrgs = ["FirmOne Pvt. Ltd.", "FirmTwo Pvt. Ltd.", "FirmThree Pvt. Ltd."];

kycRouter.post(`/credentials`, validateToken, async (req: express.Request<null, IKYCCredentialsResponse, IKYCCredentialsRequest, null>, res: express.Response<IKYCCredentialsResponse | SuccessResponse>) => {
  assert(req.body.ageRestriction, "error: please provide the ageRestriction criteria");
  // assert(req.body.countryRestriction, "error: please provide the countryRestriction criteria");

  // TODO: add a third-part API that can verify this information

  fs.writeFileSync("circuits/zk-age-constraint/input.json", JSON.stringify(req.body.ageRestriction));
  const ageRestrictionRunner = new Promise((resolve, reject) => {
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
      if (code === 1) {
        reject("exit status 1");
        return;
      }

      resolve("OK");
    });
  });

  // fs.writeFileSync("circuits/zk-country-constraint/input.json", JSON.stringify(req.body.countryRestriction));
  // const countryRestrictionRunner = new Promise((resolve, reject) => {
  //   const keygen = spawn(
  //     "bash",
  //     [
  //       "-c",
  //       `cd circuits/zk-country-constraint/circuit_js && \
  //   node generate_witness.js circuit.wasm ../input.json witness.wtns && \
  //   cd ../ && \
  //   npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v && \
  //   npx snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey && \
  //   npx snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="Parshva Runwal" -v && \
  //   npx snarkjs zkey export verificationkey circuit_0001.zkey verification_key.json && \
  //   npx snarkjs groth16 prove circuit_0001.zkey ./circuit_js/witness.wtns proof.json public.json`,
  //     ],
  //     { stdio: ["pipe", "pipe", "pipe"] }
  //   );

  //   keygen.stdout.on("data", (data) => {
  //     if (data.includes("Enter a random text. (Entropy):")) {
  //       keygen.stdin.write("low entropy\n");
  //     }
  //   });

  //   keygen.on("close", (code) => {
  //     if (code === 1) {
  //       reject("exit status 1");
  //       return;
  //     }

  //     resolve("OK");
  //   });
  // });

  try {
    await Promise.all([ageRestrictionRunner]);
  } catch (error) {
    return res.status(400).send({ success: false, message: "error: the user does not meet certain requirement criteria" });
  }

  const ageVerificationJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/verification_key.json", "utf8"));
  const ageProofJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/proof.json", "utf8"));
  const agePublicJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/public.json", "utf8"));

  // const countryVerificationJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/verification_key.json", "utf8"));
  // const countryProofJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/proof.json", "utf8"));
  // const countryPublicJSON = JSON.parse(fs.readFileSync("circuits/zk-age-constraint/public.json", "utf8"));

  const uid = req.cookies["uid"];
  await prisma.user.update({
    where: { uid: uid },
    data: {
      ageVerificationJSON: ageVerificationJSON,
      agePublicJSON: agePublicJSON,
      // countryVerificationJSON: countryVerificationJSON,
      // countryPublicJSON: countryPublicJSON,
    },
  });

  return res.status(200).send({ ageProofJSON });
});

kycRouter.post(`/approve`, validateToken, async (req: express.Request<null, SuccessResponse, IKYCApproveRequest, null>, res: express.Response<SuccessResponse>) => {
  assert(req.body.requestId, "error: please provide the requestId field");
  assert(req.body.ageProofJSON, "error: please provide the ageRestriction criteria");
  // assert(req.body.countryProofJSON, "error: please provide the countryRestriction criteria");

  // TODO: add a third-part API that can verify this information

  const uid = req.cookies["uid"];

  const request = await prisma.request.findFirst({ where: { id: req.body.requestId } });
  if (request?.userId === uid) {
    let user = await prisma.user.findFirst({ where: { uid: uid } });
    if (!user?.ageVerificationJSON || !user?.agePublicJSON) {
      return res.status(400).send({ success: false, message: "error: cannot find user credentials" });
    }

    fs.writeFileSync("circuits/zk-age-constraint/verification.json", JSON.stringify(user.ageVerificationJSON));
    fs.writeFileSync("circuits/zk-age-constraint/proof.json", JSON.stringify(req.body.ageProofJSON));
    fs.writeFileSync("circuits/zk-age-constraint/public.json", JSON.stringify(user.agePublicJSON));

    try {
      await new Promise((resolve, reject) => {
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
          if (code === 1) {
            reject("exit code 1");
            return;
          }

          resolve("exit code 0");
        });
      });

      return res.status(200).send({ success: true, message: "user claim has been verified" });
    } catch (error) {
      return res.status(401).send({ success: false, message: "user claim could not be verified" });
    }
  } else {
    return res.status(400).send({ success: false, message: "error: cannot approve a request that does not belong to you" });
  }

  // if (!user?.countryVerificationJSON || !user?.countryPublicJSON) {
  //   return res.status(400).send({ success: false, message: "error: cannot find user credentials" });
  // }
});

kycRouter.get(`/request`, validateToken, async (req: express.Request<null, IKYCRequestResponse, IKYCRequest, null>, res: express.Response<IKYCRequestResponse>) => {
  const uid = req.cookies["uid"];

  const requests = await prisma.request.findMany({
    where: { userId: uid },
  });

  return res.status(200).send({ requests: requests });
});

kycRouter.post(`/request`, async (req: express.Request<null, IKYCRequestResponse | SuccessResponse, IKYCRequest, null>, res: express.Response<IKYCRequestResponse | SuccessResponse>) => {
  assert(req.body.organizationName);
  assert(req.body.uid);
  assert(req.body.webhookCall);

  if (!whitelistedOrgs.includes(req.body.organizationName)) {
    return res.status(400).send({ success: false, message: "you are not authorized to use this api yet, please contact us" });
  }

  let user = await prisma.user.findFirst({ where: { uid: req.body.uid } });
  if (!user?.ageVerificationJSON || !user?.agePublicJSON) {
    return res.status(400).send({ success: false, message: "error: cannot find user credentials" });
  }

  const request = await prisma.request.create({
    data: {
      organizationId: req.body.organizationName,
      userId: req.body.uid,
      webhookCall: req.body.webhookCall,
    },
  });

  return res.status(200).send({ requests: [request] });
});

export default kycRouter;
