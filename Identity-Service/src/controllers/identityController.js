import User from "../models/user.js";
import logger from "../utils/logger.js";
import {validateRegistration} from "../utils/validation.js"
import generateToken from "../utils/generateToken.js"

const registerUser=async(req,res)=>{
    logger.info("Register User endpoint Hit...")
    try{
        const {error}=validateRegistration(req.body)
        if (error) {
            logger.warn(`Validation error: ${error.details?.[0]?.message}`);
            return res.status(400).json({
                success: false,
                message: error.details?.[0]?.message || "Validation Error"
            });
        }

        const {email,password,username}=req.body

        const findUser=await User.findOne({ $or:[{email},{username}]})
        if (findUser){
            logger.warn("User already exists")
            return res.status(400).json({
                success: false,
                message: "User Already exists please login"
            });
        }
        const newUser=new User({
            email,username,password
        })
        newUser.save()
        logger.info("User saved successfully",newUser._id)
        const {accessToken,RefreshToken}=await generateToken(newUser)
        res.status(201).json({
            success:true,
            message:"User regiistered successfully",
            accessToken,
            refreshToken:RefreshToken
        })



    }catch(e){
        logger.error(`Error in registerUser ${e.message}`)
        return res.status(400).json({
            success:false,
            message:`Error Occured ${e.message}`
        })
    }
}

export default{
    registerUser
}