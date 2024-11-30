import Joi from "joi";
import { IUser } from "../Models/UserModel";
import { Request, Response, NextFunction } from "express";

// PLEASE NOTE: Placing Joi Validation logic in middleware
//We process the req.body objects data BEFORE it reaches the service layer

//Placing UserSchema Validation Here also us to pass this 

export const UserValidationSchema = Joi.object<IUser>({
  email: Joi.string().min(8).max(255).required(),
  password: Joi.string().min(8).required(),
});

