"use client";

import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import srp from "secure-remote-password/client";
import AuthLayout from "../layout/auth";

export default function SignIn() {
  const router = useRouter();

  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  const handleLogin = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setLoggingIn(true);

    const email = (ev.target as HTMLFormElement)["email"].value;
    const privateKey = (ev.target as HTMLFormElement)["privateKey"].value;

    const clientEphermal = srp.generateEphemeral();

    try {
      const loginResponse = await axios.post("http://localhost:8000/api/v1/auth/login", {
        uid: email,
        clientEphermal: {
          public: clientEphermal.public,
        },
      });

      const { salt, serverEphermal } = loginResponse.data;

      const clientSession = srp.deriveSession(clientEphermal.secret, serverEphermal.public, salt, email, privateKey);

      const verificationResponse = await axios.post("http://localhost:8000/api/v1/auth/verify", {
        uid: email,
        clientSession: {
          key: clientSession.key,
          proof: clientSession.proof,
        },
      });

      localStorage.setItem("accessToken", verificationResponse.data.message);
      router.push("/in/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message);
        setLoggingIn(false);
        return;
      }

      alert("Something unexpectedly went wrong!");
      setLoggingIn(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className={"space-y-2"}>
        <div className={"space-y-1"}>
          <span className={"text-sm font-medium"}>Email</span>
          <input type={"email"} name={"email"} placeholder={"Ex: john.doe@example.com"} className={"w-full p-2 bg-gray-50 focus:outline-none"} />
        </div>

        <div className={"space-y-1"}>
          <span className={"text-sm font-medium"}>Password</span>
          <input type={"password"} name={"privateKey"} placeholder={"Ex: $uper$ecure"} className={"w-full p-2 bg-gray-50 focus:outline-none"} />
        </div>

        <div>
          <button disabled={loggingIn} className={"p-2 flex items-center justify-center gap-2 text-sm text-white bg-blue-500 rounded-lg"}>
            {loggingIn ? <ClipLoader size={16} color={"#FFFFFF"} /> : <></>}
            <span>{loggingIn ? "Signing In" : "Sign In"}</span>
          </button>
        </div>
      </form>

      <div>
        <span className={"text-sm text-gray-500"}>New here?</span>{" "}
        <Link href={"/auth/sign-up"} className={"text-sm text-blue-500"}>
          Click here to Sign Up
        </Link>
      </div>
    </AuthLayout>
  );
}
