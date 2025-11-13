import jwt,{JwtPayload} from "jsonwebtoken";
import {Request,Response,NextFunction} from "express"

declare global {
  namespace Express {
    interface Request {
      admin?: string | JwtPayload;
    }
  }
}


function auth(req:Request, res:Response, next:NextFunction):void {
  const authHeader = req.headers["authorization"];
  if (!authHeader){
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  } 
  console.log(authHeader)
  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    res.status(401).json({ success: false, message: "Invalid token format" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: "Token is not valid" });
  }
}

export default auth;
