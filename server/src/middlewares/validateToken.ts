import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  throw new Error("error: JWT_SECRET_KEY not found in the environment variables");
}

const validateToken = (req: any, res: any, next: any) => {
  try {
    const accessToken = req.header("authorization");

    if (!accessToken) {
      return res.status(403).send({ success: false, message: "error: please include an access token in the authorization header" });
    }

    const isValidJWT = jwt.verify(accessToken, JWT_SECRET_KEY);
    if (isValidJWT) {
      req.cookies = { uid: (jwt.decode(accessToken) as any)?.userId };
      next();
    } else {
      return res.status(401).send({ success: false, message: "error: jwt token has expired" });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({ success: false, message: "error: jwt token is invalid" });
  }
};

export default validateToken;
