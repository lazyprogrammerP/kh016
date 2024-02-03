"use client";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function DashboardPage() {
  const router = useRouter();

  const [verifyingAccess, setVerifyingAccess] = useState<boolean>(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("No access token found, please sign in!");
      router.push("/auth/sign-in");
      return;
    }

    axios
      .get("http://localhost:8000/api/v1/auth/validateToken", { headers: { Authorization: accessToken } })
      .then(() => {
        setVerifyingAccess(false);
      })
      .catch((error) => {
        if (error instanceof AxiosError) {
          alert(error.response?.data.message);
        }

        alert("Something unexpectedly went wrong!");
        router.push("/auth/sign-in");
      });
  }, []);

  return verifyingAccess ? (
    <div className={"w-full h-screen flex items-center justify-center gap-2"}>
      <ClipLoader className={"w-5 h-5"} color={"#C5C5C5"} />
      <p className={"text-2xl text-gray-500"}>Please wait as we verify your identity!</p>
    </div>
  ) : (
    <div className={"w-full h-screen bg-gray-100"}>
      <h1>Get Verified KYC Credentials</h1>
    </div>
  );
}
