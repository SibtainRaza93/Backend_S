// Import Cloudinary
import { v2 as cloudinary } from "cloudinary";

// Import fs to work with files
import fs from "fs";


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {

        // If no file path, return null
        if (!localFilePath) return null;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File uploaded successfully
        // console.log("File is uploaded on Cloudinary", response.url);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary as the upload
        return response;

    } catch (error) {

        // Remove local file if upload fails
        fs.unlinkSync(localFilePath);
    }
};


// Export upload function
export { uploadOnCloudinary };