import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
        });
    } catch (error) {
        console.log(error);
    }
}       

export default connectCloudinary;
