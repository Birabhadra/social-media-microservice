import User from "../models/user.js";
import logger from "../utils/logger.js";
import {validateRegistration,validateLogin} from "../utils/validation.js"
import generateToken from "../utils/generateToken.js"
import refreshToken from "../models/refreshToken.js";

const registerUser=async(req,res)=>{
    console.log(req)
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
        await newUser.save()
        logger.info("User saved successfully",newUser._id)
        const {accessToken,RefreshToken}=await generateToken(newUser)
        res.status(201).json({
            success:true,
            message:"User registered successfully",
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

const loginUser=async(req,res)=>{
    logger.info("Login User endpoint Hit...")
    try{
        const {error}=validateLogin(req.body)
        if (error) {
            logger.warn(`Validation error: ${error.details?.[0]?.message}`);
            return res.status(400).json({
                success: false,
                message: error.details?.[0]?.message || "Validation Error"
            });
        }
        const {email,password}=req.body

        const findUser=await User.findOne({email})
        if(!findUser){
            logger.warn(`No User Found`)
            return res.status(400).json({
                success:false,
                message:"User not found Please sign Up"
            })
        }
        const isMatch = await findUser.comparePassword(password);
        if (!isMatch) {
            logger.warn('Invalid credentials');
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            });
        }
        const {accessToken,RefreshToken}=await generateToken(findUser)
        logger.info("User Logged successfully",findUser._id)
        return res.status(201).json({
            success:true,
            message:"User LoggedIn successfully",
            accessToken,
            refreshToken:RefreshToken
        })

    }catch(e){
        logger.error(`Error in Login User ${e.message}`)
        return res.status(400).json({
            success:false,
            message:`Error Occured ${e.message}`
        })
    }

}

const refreshTokenController=async(req,res)=>{
    try{
        const {RefreshToken}=req.body
        if (!RefreshToken){
            logger.warn("Refresh token missing");
            return res.status(400)>json({
                success:false,
                message:"Refresh Token is required"
            })
        }

        const FindToken=await refreshToken.find({token:RefreshToken})

        if (!FindToken||FindToken.expiresAt < new Date()){
            logger.warn("Invalid or expired refresh token");

            return res.status(401).json({
                success: false,
                message: `Invalid or expired refresh token`,
            });
        }
        const user=await User.findById(FindToken.user)
        if(!user){
            logger.warn("user not found")
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        const {newAccessToken,newRefreshToken}=await generateToken(user);

        await refreshToken.deleteOne({_id:FindToken._id})
        res.status(200).json({
            success:true,
            accessToken:newAccessToken,
            refreshToken:newRefreshToken,
            message:"Token generated successfully"
        })

    }catch(e){
        logger.error(`Error in refreshing token ${e.message}`)
        return res.status(400).json({
            success:false,
            message:`Error Occured ${e.message}`
        })
    }
}
const logoutController=async(req,res)=>{
    try{
        const {RefreshToken}=req.body
        if (!RefreshToken){
            logger.warn("Refresh token missing");
            return res.status(400)>json({
                success:false,
                message:"Refresh Token is required"
            })
        }

        const FindToken=await refreshToken.find({token:RefreshToken})

        if (!FindToken||FindToken.expiresAt < new Date()){
            logger.warn("Invalid or expired refresh token");

            return res.status(401).json({
                success: false,
                message: `Invalid or expired refresh token`,
            });
        }
        const user=await User.findById(FindToken.user)
        if(!user){
            logger.warn("user not found")
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        await refreshToken.deleteOne({_id:FindToken._id})
        res.status(200).json({
            success:true,
            message:"User logged out successfully"
        })

    }catch(e){
        logger.error(`Error in Logout User ${e.message}`)
        return res.status(400).json({
            success:false,
            message:`Error Occured ${e.message}`
        })
    }

}
export default{
    registerUser,
    loginUser,
    refreshTokenController,
    logoutController
}