import express from "express"
import isauthenticated from "../middlewares/authenticate.js"
import postController from "../controllers/postController.js"
const router=express.Router()


router.post("/create-post",isauthenticated,postController.createPost);
router.get("/all-posts",postController.getAllPosts);
router.get("/:id", postController.getPost);
router.delete("/:id",isauthenticated,postController.deletePost);

export default router;