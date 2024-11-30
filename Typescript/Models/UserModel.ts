import mongoose, { Document, model, Schema } from "mongoose";
import cuid from "cuid";
import jwt from "jsonwebtoken";
/**
 *
 * @description This is the User Model which is the foundation of building
 * the MVC model architecture
 */
enum UserRoles {
  USER = "user",
  ADMIN = "admin",
}

interface UserProfile {
  url: string;
  alt?: string;
}

//RegEx Function to check for company email at registration
// Literals: Match exact characters (abc matches "abc").
// Metacharacters: Symbols with special meanings:
// .: Matches any character.
// *: Matches 0 or more of the preceding character.
// +: Matches 1 or more of the preceding character.
// ?: Matches 0 or 1 of the preceding character.
const validateUserEmail = (email: string) => {
  const staffMemberRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return staffMemberRegExp.test(email);
};

//Create an interface for type definition of the Model
export interface IUser extends Document {
  id: string; //use Collision Resistant ID (CUID's) over integer values
  email: string;
  password: string;
  role: UserRoles;
  //Placing Profile here means high coupling between user and profile
  //For feature MongoDB queries we can find a profile of a user based on their id
  profile: {
    bio: string;
    profilePicture: UserProfile;
    user: IUser["_id"]; //Create a querying relation between the User Document and Profile Document
  };
  generateAuthToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      default: cuid(), //Call the cuid() to generate CUID's for each user
      unique: true,
    },
    email: {
      type: String,
      //NOTE: min and max for int's, minLength and maxLength for strings and array's
      minlength: [8, "Email must be at least 8 characters long"],
      maxlength: [255, "Email must be no more than 255 characters"],
      unique: true,
      validate: {
        //Staff email validator
        //Validate by using RegExp to check for company suffix after the "@"
        validator: validateUserEmail, //@line 26
      },
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [255, "Passwrod must be no more than 255 characters"],
    },
    role: {
      type: String,
      enum: UserRoles,
      //Set the default to User and use the
      //.pre method to update it if needed
      default: UserRoles.USER,
    },
    //Set the type to an object to create query relationship
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile", //Here we are referencing the Profile model
    },
  },
  {
    timestamps: true, //This enables use to createdAt and updatedAt fields
    //Enables virtual field (calculated fields that are not stored in the db)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//The pre method gives use ability to run data middleware style code execution
//Before the user request to the database is completed
UserSchema.pre("save", function (next) {
  //NOTE: Please remember to a local named function only here
  //If you try to use an arrow function you will not have access to the
  //this prop e.g this.profile etc

  //Check to see user email in the request body is a company one or a regular email
  if (validateUserEmail(this.email)) {
    this.role = UserRoles.ADMIN;
  }
  //NOTE: Always call the next function otherwise the request processing pipeline
  //will stall because this function will not be able to pass control to the next function
  next();
});

// Custom Methods
//JWT Token Generation - For Small projects jwt being coupled to user is cool
//For larger projects create utility folder for the jwt logic as you may need
//it in multiple places

//Expert Object Principle
UserSchema.methods.generateAuthToken = function (): string {
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_SECRET!, //use ! operator to tell typescript this key has a defined value
    { expiresIn: "30m" } //Set the JWT expiration time
  );
  return token;
};

//Comupted
//Here there isn't much of use for virtuals but here is a verbose example:
UserSchema.virtual("userRoleKey").get(function () {
  return `${this.role}-${this.email}`;
  //We use the "get" to access the values are create our custom data structures
});

//Settter (.set) we use this apply our calculated values to fields in the schema
UserSchema.virtual("userRoleKey").set(function (key) {
  //Here as verbose example we can extract the userRoleKey template string
  //and then split into role and email and set those values to be our new
  //role and email...
  const [role, email] = key.split("-"); //Split at the -
  this.role = role; //assigns the role part of the string as the new role
  this.email = email; //assigns email part of the string as the new email
});

//NOTE: For the best performance key the virtual getters and setters simple
export default model<IUser>("User", UserSchema);
