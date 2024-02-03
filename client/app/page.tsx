"use client";

import Image from "next/image";
import { useEffect } from "react";

import { ZkBobClient, ClientConfig, AccountConfig, ProverMode, TransferRequest, deriveSpendingKeyZkBob, DepositType, TxType } from "zkbob-client-js";

async function zkBobExample(): Promise<void> {
  // Client configuration includes set of pools, chains, parameters and other options
  const clientConfig: ClientConfig = {
    pools: {
      "BOB2USDC-goerli": {
        chainId: 5,
        poolAddress: "0x49661694a71B3Dab9F25E86D5df2809B170c56E6",
        tokenAddress: "0x28B531401Ee3f17521B3772c13EAF3f86C2Fe780",
        relayerUrls: ["https://dev-relayer.thgkjlr.website/"],
        delegatedProverUrls: [],
        feeDecimals: 2,
        depositScheme: DepositType.AuthPolygonUSDC,
        ddSubgraph: "zkbob-bob-goerli",
      },
    },
    chains: {
      "11155111": {
        rpcUrls: ["https://sepolia.infura.io/v3/2a219563d6f8480db0e2ce66bcd8f29e", "https://eth-sepolia-public.unifra.io"],
      },
      "5": {
        rpcUrls: ["https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
      },
      "420": {
        rpcUrls: ["https://goerli.optimism.io"],
      },
    },
    snarkParams: {
      transferParamsUrl: "https://r2-staging.zkbob.com/transfer_params_20022023.bin",
      transferVkUrl: "https://r2-staging.zkbob.com/transfer_verification_key_20022023.json",
    },
  };

  // creating a zkBob client without account to be worked on 'BOB-sepolia' pool
  const client = await ZkBobClient.create(clientConfig, "BOB2USDC-goerli");

  // now you can get relayer fee or pool limits for example
  // const depositFee = await client.atomicTxFee(TxType.BridgeDeposit);
  // console.log(`Relayer deposit fee: ${depositFee} Gwei`);
  // console.log(`Pool deposit total limit: ${(await client.getLimits(undefined)).deposit.total} Gwei`);

  // now let's attach account generated from the arbitrary 12-words mnemonic:
  const mnemonic = "magic jargon demon hello marriage happy bench wash doctor risk end cheap";
  const accountConfig: AccountConfig = {
    // spending key is a byte array which derived from mnemonic
    sk: deriveSpendingKeyZkBob(mnemonic),
    // pool alias which should be activated
    pool: "BOB2USDC-goerli",
    // the account should have no activity (incoming notes including) before that index
    // you can use -1 value only for newly created account or undefined (or 0) for full state sync
    birthindex: 0,
    // using local prover
    proverMode: ProverMode.Local,
  };
  await client.login(accountConfig);

  // now the client is ready to send transactions, but let's get an account balance first
  // account state will be synced under-the-hood (pass false to getTotalBalance to prevent sync)

  console.log(`HAS ACCOUNT: ${client.hasAccount()}`);

  console.log(`ACCOUNT BALANCE: ${await client.getTotalBalance()}`);

  await client.logout();
}

export default function Home() {
  useEffect(() => {
    zkBobExample();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By <Image src="/vercel.svg" alt="Vercel Logo" className="dark:invert" width={100} height={24} priority />
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert" src="/next.svg" alt="Next.js Logo" width={180} height={37} priority />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>Explore starter templates for Next.js.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>Instantly deploy your Next.js site to a shareable URL with Vercel.</p>
        </a>
      </div>
    </main>
  );
}
