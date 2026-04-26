import Search from "../models/search.model.js"
import logger from "../utils/logger.js"

export async function handlePostCreated(event) {
    try {
        await Search.updateOne(
            { postId: event.postId },
            {
                $set: {
                    userId: event.userId,
                    content: event.content,
                    createdAt: event.createdAt,
                },
            },
            { upsert: true }
        );

        logger.info(`✅ Search post upserted: ${event.postId}`);

    } catch (e) {
        logger.error("❌ Error handling post creation event", {
            message: e.message,
            stack: e.stack,
        });
        throw e;
    }
}

export async function handlePostDeleted(event) {
    try {
        await Search.findOneAndDelete({ postId: event.postId })
        logger.info(`search post deleted: ${event.postId}`)

    } catch (e) {
        logger.error(`${e},Error handling post deletion event`)
    }
}