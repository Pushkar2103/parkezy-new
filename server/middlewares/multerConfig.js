import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const profilePictureStorage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: 'parkezy_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 200, height: 200, crop: 'fill' }]
    }
});

const parkingImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: 'parkezy_parkings', 
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 800, height: 600, crop: 'fill' }] 
    }
});


export const uploadProfilePic = multer({ storage: profilePictureStorage });
export const uploadParkingImage = multer({ storage: parkingImageStorage });