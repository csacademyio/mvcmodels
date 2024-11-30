import Joi from "joi";
import { IUser } from "../Models/UserModel";
import { Request, Response, NextFunction } from "express";
import { UserValidationSchema } from "../Validators/UserValidationSchema";
// PLEASE NOTE: Placing Joi Validation logic in middleware
//We process the req.body objects data BEFORE it reaches the service layer
//This is a clean apporoach to use seperation of concerns



/**
 * 
  * 
 * @param req The user request received in either the body or the params
 * @param res The api response received afte the request
 * @param next The next function to pass control to the next function in
 *             the request processing pipeline
 * @returns The list of errors for failed schema validations
 */

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = UserValidationSchema.validate(req.body, {
    abortEarly: false, //Set abortEarly to false so that all errors show not just the first
    // use stripUnknown: true to remove unknown fields
  });
  if (error) {
    return res.status(400).json({
      errors: error.details.map((detail) => ({
        message: detail.message,
        field: detail.path.join("."),
      })),
    });
  }
  next();
};

// For scaling purposes we can make this schema reusable by converting our validator as follows
//Here we receive the Joi validation schema as argument and we can then reuse this logic for other models
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({
        errors: error.details.map((detail) => ({
          message: detail.message,
          field: detail.path.join("."),
        })),
      });
      return;
    }
    next();
  };
};
