import {Router} from "express"
import identityController from "../controllers/identityController.js"
const router=Router()

router.post('/register',identityController.registerUser)

router.post('/login',identityController.loginUser)

router.post('/refresh-token',identityController.refreshTokenController)

router.post('/logout',identityController.logoutController)
export default router