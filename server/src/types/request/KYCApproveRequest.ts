interface IKYCApproveRequest {
  requestId: number;
  ageProofJSON: {
    [keyName: string]: any;
  };
  countryProofJSON: {
    [keyName: string]: any;
  };
}

export default IKYCApproveRequest;
