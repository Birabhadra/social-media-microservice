import express from "express";
import helmet from "helmet";
import cors from "cors"
import cookieParser from "cookie-parser";
import RateLimit from "express-rate-limit"
import RedisConn, { rateLimiter } from "./config/redis.js"
import "dotenv/config"
import logger from "./utils/logger.js";
import {sensitiveEndpointLimiter} from "./utils/senstitiveEndpointsLimiter.js"
import authRoutes from "./routes/authRoutes.js"
import errorHandler from "./middlewares/errorHandler.js"
import connectMongo from "./config/db.js"
import { waitForRedis} from "./config/redis.js"
const app=express()
const PORT=process.env.PORT
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(cors())
app.use((req,res,next)=>{
    logger.info(`Recieved ${req.method} req to ${req.url}`);
    logger.info(`Request Body,${req.body}`);
    next();
})

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate limit exceeded for IP:${req.ip}`)
        res.status(429).json({success:false,message:"Too many requests"})
    });
})

app.use('/api/auth/register',sensitiveEndpointLimiter)

app.use('/api/auth',authRoutes)
app.use(errorHandler)
app.listen(PORT,async ()=>{
    console.log(`Server running on http://localhost:${PORT}`)
    await connectMongo();
    await waitForRedis();

})
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", {
      promise,
      reason,
    });
  });