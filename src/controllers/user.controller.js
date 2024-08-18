import promisesWrapper from "../utils/promisesWrapper.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudnary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = promisesWrapper( async(req,res,next) => {
    
    const { username, email, fullName , password} = req.body;

    if(
        [username,email,fullName,password].some(
            (fields)=> fields.trim() === ""
            )
    ){
        throw new ApiError(
            400 ,"All fields are mandatory"
        )
    }

    const existedUser   = await  User.findOne({ $or : [ {username}, {email}]});

    if(existedUser){
        throw new ApiError(400, "User already existed");
    }
    console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.length > 0 ? req.files.coverImage[0].path : null;

    console.log(req.files)

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar image not found");
    }

    const avatar   =  await uploadToCloudnary(avatarLocalPath)
    const coverImage =  await uploadToCloudnary(coverImageLocalPath)

    

    console.log(avatar);
    if(!avatar){
        throw new ApiError(400, "Failed to upload image ");
    }

    const user = await User.create(
        {
            username,
            email,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            fullName,
            password
        }
    ) 

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while creating the user in db");
    }

    return res.status(201).json(
      new ApiResponse(200,createdUser)
    )
    
})

export default registerUser;