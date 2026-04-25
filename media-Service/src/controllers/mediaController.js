import Media from "../models/media.model.js"
import logger from "../utils/logger.js"
import { uploadMediaToCloudinary } from "../config/cloudinary.js"

const uploadMedia = async (req, res) => {
    logger.info("Strating media Upload")
    try {
        console.log(req.file)
        if (!req.file) {
            logger.error("No file found.Please add a file and try again");
            return res.status(400).json({
                success: false,
                message: "No file found. Please add a file and try again"
            })
        }
        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.userId;

        logger.info(`File details: name=${originalname}, type=${mimetype}`);
        logger.info("Uploading to cloudinary starting...");

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(
            `Cloudinary upload successfully. Public Id: - ${cloudinaryUploadResult.public_id}`
        );

        const newMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url,
            userId
        });
        await newMedia.save();

        res.status(201).json({
            success: true,
            mediaId: newMedia._id,
            url: newMedia.url,
            message: "Media upload is successfully"
        });

    } catch (error) {
        logger.error("Error creating media", error);
        res.status(500).json({
            success: false,
            message: "Error creating media",
        });
    }
}

const getAllMedias = async (req, res) => {
    try {
        const result = await Media.find({ userId: req.user.userId })

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Can't find any media for this user"
            })
        }
        return res.status(201).json({
            success: true,
            media: result
        })
    } catch (e) {
        logger.error("Error fetching medias", error);
        res.status(500).json({
            success: false,
            message: "Error fetching medias",
        });
    }
}

export default {
    uploadMedia,
    getAllMedias
}