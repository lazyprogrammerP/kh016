import { Chains, ClientConfig, DepositType, Pools, SnarkConfigParams } from "zkbob-client-js";

if (!process.env.ZKBOB_POOL_NAME) {
  throw new Error("error: ZKBOB_POOL_NAME not found in the environment");
}

if (!process.env.ZKBOB_CHAIN_ID || !parseInt(process.env.ZKBOB_CHAIN_ID)) {
  throw new Error("error: ZKBOB_CHAIN_ID not found in the environment");
}

if (!process.env.ZKBOB_POOL_ADDRESS) {
  throw new Error("error: ZKBOB_POOL_ADDRESS not found in the environment");
}

if (!process.env.ZKBOB_TOKEN_ADDRESS) {
  throw new Error("error: ZKBOB_TOKEN_ADDRESS not found in the environment");
}

if (!process.env.ZKBOB_RELAYER_URL) {
  throw new Error("error: ZKBOB_RELAYER_URL not found in the environment");
}

if (!process.env.ZKBOB_CHAIN_RPC_URL) {
  throw new Error("error: ZKBOB_CHAIN_RPC_URL not found in the environment");
}

if (!process.env.ZKBOB_SNARK_TRANSFER_PARAMS_URL) {
    throw new Error("error: process.env.ZKBOB_SNARK_TRANSFER_PARAMS_URL not found in the environment")
}

const ZkBobPools: Pools = {
  [process.env.ZKBOB_POOL_NAME]: {
    chainId: parseInt(process.env.ZKBOB_CHAIN_ID),
    poolAddress: process.env.ZKBOB_POOL_ADDRESS,
    tokenAddress: process.env.ZKBOB_TOKEN_ADDRESS,
    relayerUrls: [process.env.ZKBOB_RELAYER_URL],
    delegatedProverUrls: [],
    depositScheme: DepositType.AuthPolygonUSDC,
  },
};

const ZkBobChains: Chains = {
  5: {
    rpcUrls: [process.env.ZKBOB_CHAIN_RPC_URL],
  },
};

const ZkBobSnarkParams: SnarkConfigParams = {
    transferParamsUrl: process.env.ZKBOB_SNARK_TRANSFER_PARAMS_URL
}

{
    transferParamsUrl: ,
    transferVkUrl: ,
  }

export const ZkBobClientConfig: ClientConfig = {
  pools: ZkBobPools,
  chains: ZkBobChains,
  snarkParams: ZkBobSnarkParams,
};
