import Search from "../models/search.model.js"

export const searchPostController = async (req, res) => {
    logger.info("Search endpoint hit");
    try {
        const { query } = req.query;
        const results = Search.find(
            {
                $text: { $search: query }
            },
            {
                score: { $meta: "textscore" }
            }
        ).sort({ score: { $meta: "textscore" } }).limit(10)
        res.status(200).json({
            message: "Successfully fetched results",
            results
        })
    } catch (e) {
        logger.error("Error while searching post", error);
        res.status(500).json({
            success: false,
            message: "Error while searching post",
        });
    }

}