import { app } from "./app.js";
import dbConnection from "../src/db/index.js"

dbConnection().
then((response)=>{
    app.on("error",(error)=>{
        console.log("Error on starting the App")
    });
    app.listen(`${process.env.PORT}`,()=>{
        console.log(`App started on port : ${process.env.PORT}`)
    })
}).
catch((error)=>{
    console.log(`DB Connection Failed: ${error}`)
});
