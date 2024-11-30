import { UserServices } from "../Services/UserServices";
import express from "express";
import { validateUser, validate } from "../Middleware/UserSchemaValidation";
import { UserValidationSchema } from "../Validators/UserValidationSchema";
import {
  createUserController,
  userLoginController,
} from "../Controllers/UserController";

const app = express.Router();

//Routes for User Actions
//Here we can use the reusable validate middleware -> validate(UserValidationSchema)
//Or the user specific validate User middleware -> validateUser
app.post("/signup", validate(UserValidationSchema), createUserController);
app.post(
  "/login/:username",
  validate(UserValidationSchema),
  userLoginController
);
//Endpoint - Middleware - Controller
