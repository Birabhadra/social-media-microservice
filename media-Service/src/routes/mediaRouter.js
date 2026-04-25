import express from "express";
import multer from "multer";
import mediaController from "../controllers/mediaController.js"
const router = express.Router()
import isauthenticated from "../middlewares/authenticate.js"
import logger from "../utils/logger.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
}).single("file")

router.post("/upload", isauthenticated,upload,
    // (req, res, next) => {
    //     upload(req, res, function (err) {
    //         if (err instanceof multer.MulterError) {
    //             logger.error("Multer error while uploading")
    //             return res.status(400).json({
    //                 message: "Multer error while uploading",
    //                 error: err.message,
    //                 stack: err.stack
    //             })
    //         } else if (err) {
    //             logger.error("Multer error while uploading")
    //             return res.status(400).json({
    //                 message: "Multer error while uploading",
    //                 error: err.message,
    //                 stack: err.stack
    //             })

    //         }
    //         if (!req.file) {
    //             return res.status(400).json({
    //                 message: "No file found!",
    //             });
    //         }
    //         next();
    //     });

    // }, 
    mediaController.uploadMedia
)

router.get("/get", isauthenticated, mediaController.getAllMedias);

export default router;