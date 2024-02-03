import srpClient from "secure-remote-password/client";
import srpServer from "secure-remote-password/server";

const username = "linus@folkdatorn.se";
const password = "$uper$ecure";

const salt = srpClient.generateSalt();
const privateKey = srpClient.derivePrivateKey(salt, username, password);
const verifier = srpClient.deriveVerifier(privateKey);

console.log(`salt: ${salt}`);
console.log(`verifier: ${verifier}`);

const serverEphemeral = srpServer.generateEphemeral(verifier);
console.log(`serverEphermal.public: ${serverEphemeral.public}`);

const clientEphemeral = srpClient.generateEphemeral();
const clientSession = srpClient.deriveSession(clientEphemeral.secret, serverEphemeral.public, salt, username, privateKey);

console.log(`clientSession.key: ${clientSession.key}`);
console.log(`clientSession.proof: ${clientSession.proof}`);

const serverSecretEphemeral = serverEphemeral.secret;
const serverSession = srpServer.deriveSession(serverSecretEphemeral, clientEphemeral.public, salt, username, verifier, clientSession.proof);

console.log(srpClient.verifySession(clientEphemeral.public, clientSession, serverSession.proof));
