import srp from "secure-remote-password/client";

// step 1 - register:
const username = "john.doe@example.com";
const password = "$uper$ecure";

// const salt = srp.generateSalt();
const salt = "cfb98f8ae14b413285eadc7a24ce9b06ac72e87d1d11aef30496700af863cb7c";
// const privateKey = srp.derivePrivateKey(salt, username, password);
const privateKey = "0b4347255090d11d223193a4711ff14c2bd305dc22623b3a5a763c536135694e";
// const verifyingKey = srp.deriveVerifier(privateKey);
const verifyingKey =
  "924420d5d80c3d12cf9ba984d25a582ddc768557ecd0d30b2c204c6329d356fcbb5b764829dd3f87327ab4d9e7cda652bd29d3de3df548b2ea0c662c3d0fa72366431eac9e46d60e9e8594024d617e1b79f3da91f2a4c8aa83787f4fc53fb8df610ee3c49b5562e96d7080e47860c45710ba3fc16421ccd9410cb16a8402aec2a941ffef2197ae71b9f58cf4b47af73eaa7d1eca8121349f465721ce350efe44c756d22a6f28dc06850d8ae37cc3a8797ede7af7e3f08771d1c40f61756e7b243fa0ee44d4b956cd7b1c4ef0bbb19144dc822e19d625d5ee06c74a17d7d343596424a0b0868fbf28fc0138d6754fe4cb316106f8f745a27d74e91cdebb71160a";

console.log(`salt: ${salt}`);
console.log(`privateKey: ${privateKey}`);
console.log(`verifyingKey: ${verifyingKey}`);

// step 2 - login:
// const clientEphemeral = srp.generateEphemeral();
const clientEphemeral = {
  secret: "c14b7367a67e3282528652bffcf0141dec0e4715d24be72b45c52b5127766fd8",
  public:
    "587dfee1db42d6e6d249ee3dafe553cead43d4dc41fb5cb8e406389298f4756a07fd1a88b6b5da60beb4651ee7939cc3979cc7faab0890fd0e5ba9bfc391e36ee89fe83e1febe98066368e5d2d4a5eac65294a6eb340e434e857aa4c71d02ed6f0ed4f27a0de7749882a55d516e3c667518cebb7c1856c01d2884fac27760aa97fb47a500b7a84aa1c0236fc7c1503b427ff40e8d12f7b2ac47596a13cd82d21d330a0f7ab4ac4a4db9a440505e4317c2dddfd0972bdd160d0da90d2f899db0d3822c854a561b54128d391a96402d8cc92c434cfcfefb01470e4a0bfb89ec425932565d4db9622263d56161c0fa97a54951dce64e243cafb79ff1f09cfbdd1c4",
};

console.log(`clientEphemeral.secret: ${clientEphemeral.secret}`);
console.log(`clientEphemeral.public: ${clientEphemeral.public}`);

// step 3 - verifying:
const serverPublicEphemeral =
  "4cdc851ddc35833ea02210d10e840c79704b133eee65675973e8a55534eecbd10041756856170dd77ac73362ed8679aa6b3c192b5d078a6ad313fb823ee722608d1ebbb0631e2e0dcca7c88ed308e5624cbb001d44e42fa8998ea17f364d4dd96f0d05cefd9f279e632b4bdfdb6bde0c44889416e9f31789351c7ae8a653bc5e87bfcb23c9d78ee19a8c02ad4e2f9f14de41aa0a0c8ce38713b5ddce9a96cb2a6d95eb9c66e5340e6137cb8b8ea71635c2e7f7d9f2da7dcb0dece033491fa3652787abc8f590e8f8bc6e7d7af0fe9f3c3052a5a2e6fed9e016435732c71475c48017e59842c6342f94ff96c726dad731b37548f3269cc85550cb45469836b27a";
const clientSession = srp.deriveSession(clientEphemeral.secret, serverPublicEphemeral, salt, username, privateKey);

console.log(`clientSession.key: ${clientSession.key}`);
console.log(`clientSession.proof: ${clientSession.proof}`);
