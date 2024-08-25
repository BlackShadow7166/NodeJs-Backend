import promisesWrapper from "../utils/promisesWrapper.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudnary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (uid) => {

   
  try {
    const user =await User.findById(uid);
    if(!user){
        throw new ApiError(404, "User not found");
    }
    const accessToken = await user.generateAccessToken();
    
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false });

    return {accessToken ,refreshToken};

  } catch (error) {
    new ApiError(500,"Error while generating access and refresh token")
  }
}


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

const loginUser = promisesWrapper(async (req,res,next) => {
    const {  email, password, username } = req.body;

    console.log(email)

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or : [
            {email},
            {username}
        ]
    })

    if(!user) {
        new ApiError(
            400,
            "User not Found!"
        )
    }
    
    console.log(user)

    const passwordChecker = await user.isPasswordCorrect(password);

    if(!passwordChecker) {
        new ApiError(
            400,
            "Password Incorrect"
        )
    }

    const { accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id);

    

    const logedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(201).
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    json(
        new ApiResponse(
            201,
            {
                user : logedInUser,accessToken,refreshToken
            },
            "User logged In Sucessfully"
        )
    );

})

const logoutUser = promisesWrapper(async (req ,res ,next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new:true
        }
        
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(201).
    cookie("accessToken","",options).
    cookie("refreshToken","",options).
    json(
        new ApiResponse(
            201,
            {},
            "User looged Out"
        )
    )
})

const refreshAccessToken = promisesWrapper(async (req,res,next) => {
    const incommingRefreshToken  = req.cookies?.refreshToken || req.body?.refreshToken;

    if(!incommingRefreshToken){
        new ApiError(400,"Refresh Token not found");
    }

    const decodedToken =  jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    if(!decodedToken){
        new ApiError(401,"Invalid Refresh Token")
    }

    const user =  await User.findById(decodedToken?._id);

    if(!user){
        new ApiError(402,"Invalid Refresh Token");
    }

    if(user.refreshToken !== incommingRefreshToken){
        new ApiError(401, "Unauthorized Request");
    }

    const { accessToken , newrefreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res.status(200).
    cookie(accessToken,accessToken,options).
    cookie(refreshToken,newrefreshToken,options).
    json(
        new ApiResponse(
            201,
            {
                accessToken : accessToken,
                refreshToken : newrefreshToken
            },
            "Access token is refreshed successfully"
        )
    )


})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};