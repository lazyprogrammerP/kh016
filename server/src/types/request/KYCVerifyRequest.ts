interface IKYCVerifyRequest {
  ageProofJSON: {
    [keyName: string]: any;
  };
  countryProofJSON: {
    [keyName: string]: any;
  };
}

export default IKYCVerifyRequest;
