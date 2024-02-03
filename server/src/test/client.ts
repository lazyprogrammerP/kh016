import srp from "secure-remote-password/client";

// step 1 - register:
const username = "john.doe@example.com";
const password = "$uper$ecure";

// const salt = srp.generateSalt();
const salt = "aca510dfcca8779de307db202528d01f11123048bf6f200290765ba74c6e5499";
// const privateKey = srp.derivePrivateKey(salt, username, password);
const privateKey = "30861c633c8bec1ca4b5364c886654a977fbd913c219a8c7ac367b17e535123a";
// const verifyingKey = srp.deriveVerifier(privateKey);
const verifyingKey =
  "30e4e824db8bdaf88e3e636010fd46a6edd3f9722df2bc2e6cb54676167e50c3a3804375e9a62b122afca0acf918659db50668456c1c02418aed457e4c15877345f39b71726bb33eac9989a0bc64f2e22cd1def46e20f83712906f214ad8fc8e1658f2fd433d17bfd2200d31a9ca452718445ca22f99087f0994d1bee924e6ae287e2cdce576fb2d7a1f3692cbe00b77492d62714537838a78dbbc058a17d8348af343ac27bc939eaac55264212406742d5ab63bf6776a331c3c4b8612e623914d562bab28a0251b35f76215ed2c32813c8822af5928ffd240bc33ab8da5159b1c303c5817b95ab8043cf3da4f14850a7017ff796b37683087fa052690fadd58";

console.log(`salt: ${salt}`);
console.log(`privateKey: ${privateKey}`);
console.log(`verifyingKey: ${verifyingKey}`);

// step 2 - login:
// const clientEphemeral = srp.generateEphemeral();
const clientEphemeral = {
  secret: "7907c2c99ab09797285fd165ffbb93015c2abdee608ea144a0260fbe25deba32",
  public:
    "18d0726dcb0b6f57a51a68dbfefa35dd0fcc7045d80f687477fe3e120d36bf576a04bdeeafeba693a18eff6e2d6776ec09ef4def5ce257f04c0d3b907862e50a1bb8798c442f3d691c99349579773fd390e521b693a40c385c9cbd4ee6807551f206074fed1b929d493b6ab6bb78accfce2c5f8c7448beed19736968825f7d833d1699bc85cbd7ddd9ece80ee7487fe06442aa5644d970dcf25969a36d258469def13201605a63fbc04b44a0b599ee45a11e31004b1396b27d86b19155e669c60f20d8b5874876526d2a14647c6708079b46848acc69577504743e8b10fe7aeefa0a5063e0f0610d30a24e29a6fcbd757031e5aaf70fe41031adb5e0bc617e4f",
};

console.log(`clientEphemeral.secret: ${clientEphemeral.secret}`);
console.log(`clientEphemeral.public: ${clientEphemeral.public}`);

// step 3 - verifying:
const serverPublicEphemeral =
  "18d0726dcb0b6f57a51a68dbfefa35dd0fcc7045d80f687477fe3e120d36bf576a04bdeeafeba693a18eff6e2d6776ec09ef4def5ce257f04c0d3b907862e50a1bb8798c442f3d691c99349579773fd390e521b693a40c385c9cbd4ee6807551f206074fed1b929d493b6ab6bb78accfce2c5f8c7448beed19736968825f7d833d1699bc85cbd7ddd9ece80ee7487fe06442aa5644d970dcf25969a36d258469def13201605a63fbc04b44a0b599ee45a11e31004b1396b27d86b19155e669c60f20d8b5874876526d2a14647c6708079b46848acc69577504743e8b10fe7aeefa0a5063e0f0610d30a24e29a6fcbd757031e5aaf70fe41031adb5e0bc617e4f";
const clientSession = srp.deriveSession(clientEphemeral.secret, serverPublicEphemeral, salt, username, privateKey);

console.log(`clientSession.key: ${clientSession.key}`);
console.log(`clientSession.proof: ${clientSession.proof}`);
