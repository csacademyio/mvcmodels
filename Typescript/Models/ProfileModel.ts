import mongoose, { model, Document } from "mongoose";
import { IUser } from "./UserModel";

export interface IProfile extends Document {
  bio: string;
  profilePicture: string;
  user: IUser["_id"]; //ObjectId of the User Documents
}
export const profileSchema = new mongoose.Schema<IProfile>({
  bio: { type: String },
  profilePicture: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  //Creating the "reverse" relationship between
  //profile and users
});

//Challenge - Try and create your own virtual functions :)
//Use the UserModel file to help you...

//NOTE: the name of model is what you use for the ref Prop
//i.e The user model name is called "User" therefore ref has be "User"
export default model<IProfile>("Profile", profileSchema);
