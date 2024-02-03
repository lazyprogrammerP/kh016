interface IRegisterRequest {
  uid: string;
  salt: string;
  verifyingKey: string;
}

export default IRegisterRequest;
