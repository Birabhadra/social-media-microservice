import {Router} from "express"
import identityController from "../controllers/identityController.js"
const router=Router()

router.post('/register',identityController.registerUser)



export default router