import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: "auto"
        },
            (error, result) => {
                if (error) {
                    logger.error(`Error while uploading media to cloudinary,${error}`)
                } else {
                    resolve(result)
                }
            }
        )
        uploadStream.end(file.buffer);
    })
}; cloudinary.uploader.de

const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        logger.info(`Media deleted successfully from cloud storage ${publicId}`)
    } catch (error) {
        logger.error("Error deleting media from cludinary", error);
        throw error;

    }
}

export {
    uploadMediaToCloudinary,
    deleteMediaFromCloudinary
}