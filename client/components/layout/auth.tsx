import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={"w-full h-screen"}>
      <div className={"w-full h-full flex"}>
        <div className={"w-full lg:max-w-md p-8 space-y-4 bg-white rounded-lg shadow-lg"}>
          <div className={"space-y-1"}>
            <h1 className={"text-2xl font-bold"}>0xAuth</h1>
            <p className={"text-gray-500"}>A trustless authentication system for payment systems.</p>
          </div>

          {children}
        </div>

        <div className={"hidden lg:block flex-1 h-full"}>
          <img src={"/auth-banner.jpg"} className={"w-full h-full object-cover"} />
        </div>
      </div>
    </div>
  );
}
