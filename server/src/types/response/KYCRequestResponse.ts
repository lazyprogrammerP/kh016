import { Request } from "@prisma/client";

interface IKYCRequestResponse {
  requests: Array<Request>;
}

export default IKYCRequestResponse;
