import Search from "../models/search.model.js"
import logger from "../utils/logger.js"

export async function handlePostCreated(event) {
    try {
        const newSearchPost = new Search({
            postId: event.postId,
            userId: event.userId,
            content: event.content,
            createdAt: event.createdAt
        })
        await newSearchPost.save()
        logger.info(`Search post created:${event.postId},${newSearchPost._id.toString()}`)

    } catch (e) {
        logger.error(`${e},Error handling post creation event`)
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