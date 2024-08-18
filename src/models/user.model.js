import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema (

    {
        username:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
            unique:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
            unique:true,
            index:true
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true
        },
        coverImage:{
            type:String,
        },
        password:{
            type:String,
            required:true,
        },
        refreshToken:{
            type:String,   
        },
        watchHistory: [
            {
                type: mongoose.Types.ObjectId,
                ref:"Video"
            }
        ]
    },

    {
        timestamps: true
    }
);

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) {next();}
    this.password = await bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
        {
            _id : this._id,
            username: this.username,
            email:this.email,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
        {
            _id : this._id,
        },  
        process.env.Refresh_TOKEN_SECRET,
        {
            expiresIn:Refresh_TOKEN_EXPIRY
        }  
    )
}


export const User = mongoose.model("User",userSchema);