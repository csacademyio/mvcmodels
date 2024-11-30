import { UserServices } from "../Services/UserServices";
import express, { NextFunction, Request, Response } from "express";
import { validateUser } from "../Middleware/UserSchemaValidation";
import RedisClient from "../Redis/client";
import session from "express-session";

/**
 *
 * @param req The user request received in either the body or the params
 * @param res The api response received afte the request
 * @param next The next function to pass control to the next function in
 *             the request processing pipeline
 *
 * @description The User Controller layer is response for handling
 *              the HTTP request and responses. It calls the
 *              needed services to process a request and then return the response
 */

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserServices.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

//Controller for login in our users
export const userLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, token } = req.body;
  try {
    if (!username || !token) {
      res.status(400).json({ error: "Missing username or token" });
    }

    //We store the login session with using our redis client
    //The default TTL is 1 hour
    await RedisClient.set(`session:${username}`, token);
    res.json({ message: "User has logged in succesfully" });
  } catch (error) {
    next(error);
  }
};

//Controller for loging out our users
export const userLogoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params;

  try {
    const deleteResult = await RedisClient.del(`session:${username}`);
    if (deleteResult === 0) {
      //0 mean there is no value, 1 means there is
      res.status(404).json({ error: "User Session not found" });
    }
  } catch (error) {
    next(error);
  }

  //if delete is successful
  res.json({
    message: "User logged out succesfully",
  });
};

//Retreiving Session info, since usernames, emails and id's are unique
//We can choose on the most user-friendly inputs, here I'll use usernames

export const getUserSessionByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params;

  try {
    //the `session:${username}` is quite repeative ideally this should be
    //stored in config file and reused across our codebase
    const sessionToken = await RedisClient.get(`session:${username}`);
    if (!sessionToken) {
      res.status(404).json({ error: "User Session not found" });
    }
    res.json({ data: { username }, token: sessionToken });
  } catch (error) {
    next(error);
  }
};
