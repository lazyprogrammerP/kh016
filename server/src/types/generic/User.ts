interface User {
  uid: string;
  salt: string;
  verifyingKey: string;
  serverEphermal?: {
    secret: string;
    public: string;
  };
  clientEphermal?: {
    public: string;
  };
}

export default User;
