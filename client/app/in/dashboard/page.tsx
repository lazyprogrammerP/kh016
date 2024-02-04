"use client";

import KYCCredentialsForm from "@/components/kyc/credentials";
import Nav from "@/components/layout/nav";
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
      <ClipLoader size={18} color={"#C5C5C5"} />
      <p className={"lg:text-lg text-gray-500"}>Please wait as we verify your identity!</p>
    </div>
  ) : (
    <div className={"w-full min-h-screen p-4 lg:p-8 space-y-4 lg:space-y-8 bg-gray-50"}>
      <Nav />
      <main className={"py-4 lg:p-4 space-y-6"}>
        <KYCCredentialsForm />
      </main>
    </div>
  );
}
