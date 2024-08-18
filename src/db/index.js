import mongoose from "mongoose";
import { dbName } from "../constants.js";

const dbConnection  =  async () => {
   try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
    console.log(`MongoDB connected at Host : ${connectionInstance.connection.host}`);
   } catch (error) {
      console.log(`DB connection Failed`)
   }
}


export default dbConnection;

