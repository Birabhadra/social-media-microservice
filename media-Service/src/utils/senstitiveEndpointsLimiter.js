import rateLimit from "express-rate-limit";
import logger from "./logger.js";
import {RedisStore} from "rate-limit-redis"
import { client } from "../config/redis.js";
export const sensitiveEndpointLimiter=rateLimit({
    windowMs:15*60*1000,
    max:50,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`sensitive rate limit exceeded from IP:${req.ip}`)
        res.status(429).json({success:false,message:"Too many requests"})
    },
    store:new RedisStore({
        sendCommand:(...args)=>client.call(...args)
    })
})