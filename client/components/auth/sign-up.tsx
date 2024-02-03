"use client";

import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import srp from "secure-remote-password/client";
import AuthLayout from "../layout/auth";

export default function SignUp() {
  const router = useRouter();

  const [registering, setRegistering] = useState<boolean>(false);

  const handleRegistration = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setRegistering(true);

    const email = (ev.target as HTMLFormElement)["email"].value;
    const password = (ev.target as HTMLFormElement)["email"].value;
    const confPassword = (ev.target as HTMLFormElement)["email"].value;

    if (password !== confPassword) {
      alert("Passwords do not match!");
      setRegistering(false);
      return;
    }

    const salt = srp.generateSalt();
    const privateKey = srp.derivePrivateKey(salt, email, password);
    const verifyingKey = srp.deriveVerifier(privateKey);

    try {
      await axios.post("http://localhost:8000/api/v1/auth/register", { uid: email, salt, verifyingKey });
      alert(`Registered successfully, your private key is: ${privateKey}. Keep it safe!`);
      router.push("/auth/sign-in");
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message);
        setRegistering(false);
        return;
      }

      alert("Something unexpectedly went wrong!");
      setRegistering(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleRegistration} className={"space-y-2"}>
        <div className={"space-y-1"}>
          <span className={"text-sm font-medium"}>Email</span>
          <input type={"email"} name={"email"} placeholder={"Ex: john.doe@example.com"} required className={"w-full p-2 bg-gray-50 focus:outline-none"} />
        </div>

        <div className={"space-y-1"}>
          <span className={"text-sm font-medium"}>Password</span>
          <input type={"password"} name={"password"} placeholder={"Ex: $uper$ecure"} required className={"w-full p-2 bg-gray-50 focus:outline-none"} />
        </div>

        <div className={"space-y-1"}>
          <span className={"text-sm font-medium"}>Confirm Password</span>
          <input type={"password"} name={"confPassword"} placeholder={"Ex: $uper$ecure"} required className={"w-full p-2 bg-gray-50 focus:outline-none"} />
        </div>

        <div>
          <button disabled={registering} className={"p-2 flex items-center justify-center gap-2 text-sm text-white bg-blue-500 rounded-lg"}>
            {registering ? <ClipLoader size={16} color={"#FFFFFF"} /> : <></>}
            <span>{registering ? "Signing Up" : "Sign Up"}</span>
          </button>
        </div>
      </form>

      <div>
        <span className={"text-sm text-gray-500"}>Already have an account?</span>{" "}
        <Link href={"/auth/sign-in"} className={"text-sm text-blue-500"}>
          Click here to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
