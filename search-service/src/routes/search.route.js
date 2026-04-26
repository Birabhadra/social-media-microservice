import express from "express"
import {searchPostController} from "../controllers/search-controller.js"
import isauthenticated from "../middlewares/authenticate.js";

const router=express.Router()

router.use(isauthenticated);

router.get("/posts", searchPostController);

export default router;