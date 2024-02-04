interface IKYCCredentialsRequest {
  ageRestriction: {
    age: number;
    ageLimit: number;
  };
  countryRestriction: {
    country: number;
    countries: number[];
  };
}

export default IKYCCredentialsRequest;
