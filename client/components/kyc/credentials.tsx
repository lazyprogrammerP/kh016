import axios from "axios";
import { useState } from "react";
import { ClipLoader } from "react-spinners";

const KYCCredentialsForm = () => {
  const [verifyingInformation, setVerifyingInformation] = useState<boolean>(false);

  const handleVerifyInformation = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setVerifyingInformation(true);

    const dob = (ev.target as HTMLFormElement)["dob"].value;
    console.log(dob);

    // axios.post(
    //   "http://localhost:8000/api/v1/kyc/credentials",
    //   {
    //     ageRestriction: {
    //         age:
    //     },
    //   },
    //   {
    //     headers: {
    //       Authorization: localStorage.getItem("accessToken"),
    //     },
    //   }
    // );
  };

  return (
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
        <select name={"citizenship"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"}>
          <option>--- select country ---</option>
        </select>
      </div>

      <div className={"col-span-12 lg:col-span-6 flex flex-col gap-2"}>
        <label className={"text-sm text-gray-500 font-medium"}>Occupation</label>
        <select name={"occupation"} className={"w-full p-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none"}>
          <option>--- select occupation ---</option>
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
