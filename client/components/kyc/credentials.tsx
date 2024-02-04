"use client";

import countries from "@/lib/countries.json";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import occupations from "@/lib/occupations.json";
import { BookOpenIcon, LinkIcon } from "@heroicons/react/24/outline";

const KYCCredentialsForm = () => {
  const [fetchingIdentity, setFetchingIdentity] = useState<boolean>(true);
  const [hasIdentity, setHasIdentity] = useState<boolean>(true);

  const [verifyingInformation, setVerifyingInformation] = useState<boolean>(false);

  const handleVerifyInformation = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setVerifyingInformation(true);

    const dob = (ev.target as HTMLFormElement)["dob"].value;
    const numberOfYearsOfLiving = (new Date().getTime() - new Date(dob).getTime()) / (1 * 365 * 24 * 60 * 60 * 1000);

    // const country = (ev.target as HTMLFormElement)["country"].value;

    try {
      const credentialsResponse = await axios.post(
        "http://localhost:8000/api/v1/kyc/credentials",
        {
          ageRestriction: {
            age: parseInt(`${numberOfYearsOfLiving}`),
            ageLimit: 18,
          },
        },
        {
          headers: {
            Authorization: localStorage.getItem("accessToken"),
          },
        }
      );

      localStorage.setItem("ageProofJSON", JSON.stringify(credentialsResponse.data.ageProofJSON));
      setVerifyingInformation(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message);
        setVerifyingInformation(false);
        return;
      }

      alert("Something unexpectedly went wrong!");
      setVerifyingInformation(false);
    }
  };

  useEffect(() => {
    let ageProofJSON = localStorage.getItem("ageProofJSON");
    if (ageProofJSON) {
      setHasIdentity(true);
      ageProofJSON = JSON.parse(ageProofJSON);
    }

    setFetchingIdentity(false);
  }, []);

  return fetchingIdentity ? (
    <div>
      <div className={"w-full p-4 flex items-center justify-center gap-2"}>
        <ClipLoader size={18} color={"#C5C5C5"} />
        <p className={"lg:text-lg text-gray-500"}>Please wait as we fetch your identity!</p>
      </div>
    </div>
  ) : hasIdentity ? (
    <div className={"w-11/12 max-w-lg mx-auto p-8 flex flex-col items-center justify-center gap-4 bg-black rounded-md shadow-md shadow-gray-100"}>
      <h1 className={"text-2xl text-zinc-300 text-center font-bold"}>Woohoo! You now have an verified identity.</h1>
      <p className={"text-sm text-zinc-300 text-center"}>Now you can complete your KYC compliances without the need to share sensitive information.</p>
      <button className={"mx-auto py-2 px-4 flex items-center justify-center gap-2 bg-white text-black rounded-md"}>
        <span>Read More</span>
        <BookOpenIcon className={"w-5 h-5"} />
      </button>
      <video src={"/identity-protocol.mp4"} autoPlay />
    </div>
  ) : (
    <form onSubmit={handleVerifyInformation} className={"w-11/12 max-w-2xl mx-auto grid grid-cols-12 gap-4"}>
      <h3 className={"col-span-12 text-lg lg:text-2xl font-medium"}>Your Digital Identity</h3>

      <div className={"col-span-12 lg:col-span-6 flex flex-col gap-2"}>
        <label className={"text-sm text-gray-500 font-medium"}>First Name</label>
        <input type={"text"} name={"firstName"} placeholder={"John"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"} />
      </div>

      <div className={"col-span-12 lg:col-span-6 flex flex-col gap-2"}>
        <label className={"text-sm text-gray-500 font-medium"}>Last Name</label>
        <input type={"text"} name={"lastName"} placeholder={"Doe"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"} />
      </div>

      <div className={"col-span-12 flex flex-col gap-2"}>
        <label className={"text-sm text-gray-500 font-medium"}>Date of Birth</label>
        <input type={"date"} name={"dob"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"} />
      </div>

      <div className={"col-span-12 lg:col-span-6 flex flex-col gap-2"}>
        <label className={"text-sm text-gray-500 font-medium"}>Citizenship</label>
        <select name={"country"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"}>
          <option>--- select country ---</option>
          {countries.map((country) => (
            <option key={country.countryCode} value={country.countryCode}>
              {country.countryName}
            </option>
          ))}
        </select>
      </div>

      <div className={"col-span-12 lg:col-span-6 flex flex-col gap-2"}>
        <label className={"text-sm text-gray-500 font-medium"}>Occupation</label>
        <select name={"occupation"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"}>
          <option>--- select occupation ---</option>
          {occupations.map((occupation) => (
            <option key={occupation} value={occupation}>
              {occupation}
            </option>
          ))}
        </select>
      </div>

      <div className={"col-span-12 flex flex-col gap-2"}>
        <label className={"text-sm text-gray-500 font-medium"}>Aadhaar Number</label>
        <input type={"text"} name={"aadhaarNumber"} placeholder={"1234-5678-9012"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"} />
      </div>

      <div className={"col-span-12 flex flex-col gap-2"}>
        <button disabled={verifyingInformation} className={"p-2 flex items-center justify-center gap-2 text-sm text-white bg-blue-500 rounded-lg"}>
          {verifyingInformation ? <ClipLoader size={16} color={"#FFFFFF"} /> : <></>}
          <span>{verifyingInformation ? "Verifying Information" : "Create My Identity"}</span>
        </button>
      </div>
    </form>
  );
};

export default KYCCredentialsForm;
