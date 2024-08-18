import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();

app.use(cors(
    {
        origin : process.env.CORS_ORIGIN,
        Credential : true
    }
));
app.use(express.json(
    {
        limit: "16kb"
    }
));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({
    limit:"16kb",
    extended: true
}));


// Import the routers
import userRouter from "./routes/user.routes.js";



// routes decleration

app.use("/api/v1/users",userRouter)








export {app};