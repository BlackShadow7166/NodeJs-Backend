import jwt from "jsonwebtoken";
import promisesWrapper from "../utils/promisesWrapper.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


export const verifyJWT = promisesWrapper(async (req,res,next)=>{

    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization").replace("Bearer","");

        if(!accessToken){
            new ApiError(401,"Unauthorized Access")
        }

        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);

        const user = User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            new ApiError(401,"Invalid Access Token")
        }

        req.user = user;

        next();

        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

    

})