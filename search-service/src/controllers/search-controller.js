import Search from "../models/search.model.js"
import logger from "../utils/logger.js"

export const searchPostController = async (req, res) => {
    logger.info("Search endpoint hit");
    try {
        const { query } = req.query;
        if (typeof query !== "string" || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "`query` is required and must be a non-empty string",
            });
        }
        const results = await Search.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(10);
        res.status(200).json({
            message: "Successfully fetched results",
            results
        })
    } catch (e) {
        logger.error("Error while searching post", e);
        res.status(500).json({
            success: false,
            message: "Error while searching post",
        });
    }

}