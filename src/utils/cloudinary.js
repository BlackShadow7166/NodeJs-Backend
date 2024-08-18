import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"



// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View Credentials' below to copy your API secret
});
    

const uploadToCloudnary = async function (localFilePath) {
    try {
        if(!localFilePath ) {
            console.log("local path for file not found");
            return null;
        }else{
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:'auto'
            });
            console.log(`Image successfully uploaded on cloudnary: ${response}`);
            fs.unlinkSync(localFilePath);
            return response;
        }
        

    } catch (error) {
        fs.unlinkSync(localFilePath);
    }
}

export {uploadToCloudnary};






