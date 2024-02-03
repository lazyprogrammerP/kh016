interface ILoginResponse {
  salt: string;
  serverEphermal: { public: string };
}

export default ILoginResponse;
