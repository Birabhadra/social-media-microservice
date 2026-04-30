import logger from "../utils/logger.js"
import { validateCreatePost } from "../utils/validation.js"
import Post from "../models/post.model.js"
import client from "../config/redis.js"
import {publishEvent} from "../config/rabbitmq.js"
async function invalidatePostCache(req, input) {
    const cachedKey = `post:${input}`;
    await client.del(cachedKey);

    const stream = client.scanStream({ match: "posts:*", count: 100 });
    for await (const keys of stream) {
        if (keys.length) await client.del(...keys);
    }
}
const createPost = async (req, res) => {
    try {
        logger.info("CreatePost endpoint hit")
        const { error } = validateCreatePost(req.body)
        if (error) {
            logger.warn(`Validation error: ${error.details?.[0]?.message}`);
            return res.status(400).json({
                success: false,
                message: error.details?.[0]?.message || "Validation Error"
            });
        }
        const { content, mediaIds } = req.body;
        const newPost = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || []
        })
        await newPost.save()
        await invalidatePostCache(req, newPost._id.toString());
        logger.info("Post created successfully");

        await publishEvent("post.created", {
            postId: newPost._id.toString(),
            userId: newPost.user.toString(),
            content: newPost.content,
            createdAt: newPost.createdAt,
          });
        return res.status(200).json({
            message: "Post created successfully",
            success: true,
            post:newPost
        })

    } catch (e) {
        logger.error(`Error in Creating Post ${e.message}`)
        return res.status(400).json({
            success: false,
            message: `Error Occured ${e.message}`
        })
    }
}
const getAllPosts = async (req, res) => {
    try {
        logger.info("GetAllPosts endpoint hit")
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit

        const cacheKey = `posts:${page}:${limit}`
        const cachedposts = await client.get(cacheKey)
        if (cachedposts) {
            logger.info("Cache Hit")
            return res.status(200).json(JSON.parse(cachedposts))
        }
        logger.info("Cache Miss")
        const posts = await Post.find({}).sort({ createdAt: -1 }).skip(startIndex).limit(limit)
        const totalPost = await Post.countDocuments()

        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPost / limit),
            totalNoPosts: totalPost
        }

        await client.setex(cacheKey, 300, JSON.stringify(result))
        return res.status(200).json(result)
    } catch (e) {
        console.log(e)
        logger.error(`Error in getting Posts ${e.message}`)
        return res.status(400).json({
            success: false,
            message: `Error Occured ${e.message}`
        })
    }
}
const getPost = async (req, res) => {
    try {

        const postId = req.params.id;
        const cachekey = `post:${postId}`;
        const cachedPost = await client.get(cachekey);

        if (cachedPost) {
            logger.info("Cache hit")
            return res.json(JSON.parse(cachedPost));
        }
        logger.info('Cache Miss')
        const singlePostDetailsbyId = await Post.findById(postId);

        if (!singlePostDetailsbyId) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }

        await client.setex(
            cachekey,
            3600,
            JSON.stringify(singlePostDetailsbyId)
        );

        res.json(singlePostDetailsbyId);
    } catch (e) {
        logger.error(`Error in getting Post ${e.message}`)
        return res.status(400).json({
            success: false,
            message: `Error Occured ${e.message}`
        })
    }
}
const deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId,
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }
        await invalidatePostCache(req, req.params.id);
        res.json({
            message: "Post deleted successfully",
        });
    } catch (e) {
        logger.error(`Error in deleting Post ${e.message}`)
        return res.status(400).json({
            success: false,
            message: `Error Occured ${e.message}`
        })
    }
}

export default {
    createPost,
    getAllPosts,
    getPost,
    deletePost
}