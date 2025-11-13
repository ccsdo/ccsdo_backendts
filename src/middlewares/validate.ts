import { ZodError,ZodObject,ZodRawShape } from "zod";
import {Request,Response,NextFunction} from "express"
 const validate = (schema:ZodObject<ZodRawShape>) => (req:Request, res:Response, next:NextFunction):void => {
  try {
    req.body = schema.parse(req.body); // parse + validate
    next();
  } catch (err:unknown) {
     if (err instanceof ZodError && Array.isArray(err.issues)) {
      const formattedErrors = err.issues.map(e => ({
        field: e.path.join('.') || 'unknown',
        message: e.message || 'Invalid value'
      }));

       res.status(400).json({
        success: false,
        errors: formattedErrors
      });
      return;
    }
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
    // Other errors (unexpected ones)
    res.status(500).json({
      success: false,
      error: errorMessage || "Something went wrong",
    });
    return
  }
};

export default validate;
