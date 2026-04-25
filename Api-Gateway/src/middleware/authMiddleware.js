import logger from "../utils/logger.js"
import jwt from "jsonwebtoken"
import "dotenv/config"
export const validateToken=(req,res,next)=>{
    const authHeader=req.headers['authorization']
    if (!authHeader){
        return res.status(400).json({
            success:false,
            message:"Token is required"
        })
    }
    const token=authHeader?.split(' ')[1]

    if(!token){
        logger.warn('Access attempted without token')
        return res.status(401).json({
            success:false,
            message:"Authentication Required"
        })
    }

    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err||!user?.userId){
            logger.warn('Invalid  token')
            return res.status(401).json({
                success:false,
                message:"Invalid Token"
            })
        }
        req.user=user
        next()
    })


}