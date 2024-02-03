interface IVerifyRequest {
  uid: string;
  clientSession: {
    key: string;
    proof: string;
  };
}

export default IVerifyRequest;
