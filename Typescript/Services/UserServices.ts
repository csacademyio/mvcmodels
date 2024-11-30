import UserModel, { IUser } from "../Models/UserModel";
import Joi from "joi";
import { UserValidationSchema } from "../Validators/UserValidationSchema";
import bcrypt from "bcrypt";
import redisClient from "../Redis/client";

/**
 * @description This the UserServices Module here we define
 * the business logic of the application. These are actions
 * occur that make the business by serving our clients
 

*/



//Here we create validation logic to validate the data received
//In the request body


export class UserServices {
  //Create, Retreive, Update, Delete Operations (C.R.U.D)
  //all methods must be class level methods and NOT instance level methods

  //Creating a UserOperations
  static async createUser(userData: IUser) {
    //******* For smaller projects or single use validation you can use
    /******** Joi validation schema here instead on the middleware*/
    // const {error} = UserValidationSchema.validate(userData)
    // if(error) {
    //     throw new Error(error.details[0].message)
    // }

    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      //In the future you make the salt value an environment variable

      //If use UserModel.create() instead of new UserModel()
      //it will automatically save the inputs in one step
      //if you have other logic that you would like to write before
      //saving the new document use new UserModel instead.

      //Checking for duplicate entries
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error("Email already exists");
      }

      //If the user is new then continue to create user doc
      const user = new UserModel({
        ...userData,
        password: hashedPassword,
      });

      return await user.save();
    } catch (error) {
      //In the future we can use a logging service like winston
      //For better error logging in production
      console.error("Error creating user: ", error);
      throw new Error("Unable to create user at this time.");
    }
  }

  // Retreive Operations
  static async getUser(id: string) {

    // For performance enhancment to cache get requst
    //Example using redis
    

   
    try {
      //I'm creating a local cachekey for data however this
      //should be stored in config file
      const cacheKey = `user:${id}`;
      const cachedUserData = await redisClient.get(cacheKey);

       //Then we implement a cache check 
      if(cachedUserData){
        return JSON.parse(cachedUserData)
        //Remember that cache data is stored as string
        //But for it to utilised on the client side we need as an object
        //So we use parse

        //We return here before we interact with DB
        //This way decrease the input field

      }

      //First we check if there is even a user with id provided
      const user = await UserModel.findById(id);
      if (!user) {
        throw new Error(`User with ID: ${id} does not exist`);
      }

     
      return user;
    } catch (error) {
      console.error("Error retrieving user: ", error);
      throw new Error("Unable to retrieve user at this time.");
    }
  }

  // Updating Operations
  static async updateUser(id: string, updatedUserData: IUser) {
    //Checking if user exists

    try {
      const user = await UserModel.findByIdAndUpdate(
        { id },
        {
          $set: {
            ...updatedUserData,
          },
        },
        { runValidators: true, new: true }
      ); //Remember {id: id } = {id}

      if (!user) {
        throw new Error(`User with ID: ${id} does not exist`);
      }
      //You can also findByIdAndUpdate also instead of the seperated approach
      const updatedUser = await UserModel.updateOne({});
    } catch (error) {
      console.error("Error updating user: ", error);
      throw new Error("Unable to update user at this time.");
    }
  }

  //User Service to update
  static async updateUserField(id: string, field: string, value: any) {
    //I'm using type any here for the value param
    //The reason being that any value can be
    try {
      const updateObject = { [field]: value }; //use an index signature to map
      //the field you want to change to field

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: updateObject },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        throw new Error(`User with ID: ${id} does not exist`);
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user field: ", error);
      throw new Error("Unable to update user field at this time.");
    }
  }

  //Deleting a User
  static async deleteUser(id: string) {
    try {
      const deletedUser = await UserModel.findByIdAndDelete({ id });
      if (!deletedUser) {
        throw new Error(`User with ID: ${id} does not exist`);
      }

      return deletedUser;
    } catch (error) {
      console.error("Error deleting user: ", error);
      throw new Error("Unable to delete user at this time.");
    }
  }
}
