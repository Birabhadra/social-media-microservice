import express from "express";
import helmet from "helmet";
import cors from "cors"
import RateLimit from "express-rate-limit"
import cookieParser from "cookie-parser";
import RedisConn, { rateLimiter } from "./config/redis.js"
import "dotenv/config"
import logger from "./utils/logger.js";
import {sensitiveEndpointLimiter} from "./utils/senstitiveEndpointsLimiter.js"
import { waitForRedis} from "./config/redis.js"
import proxy from "express-http-proxy"
import errorHandler from "./middleware/errorHandler.js"
const app=express()
const PORT=process.env.PORT
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(cors())

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate limit exceeded for IP:${req.ip}`)
        res.status(429).json({success:false,message:"Too many requests"})
    });
})


const proxyOptions={
    proxyReqPathResolver:(req)=>{
        return req.originalUrl.replace(/^\/v1/,"/api")

    },
    proxyErrorHandler:(err,req,res,next)=>{
        logger.error(`Proxy error ${err.message}`);
        res.status(500).json({
            message:`Internal server error `,error:err.message
        })
    }
}


app.use('/v1/auth',(req,res,next)=>{console.log(req);next()},proxy(process.env.IDENTITY_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["content-type"]="application/json"
        return proxyReqOpts
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response recieved from identity service:${proxyRes.statusCode}`)

        return proxyResData
    }
}))



app.use(errorHandler)
app.listen(PORT,async ()=>{
    logger.info(`Proxy Server running on http://localhost:${PORT}`)
    logger.info(`Identity service running on ${process.env.IDENTITY_SERVICE_URL}`)
    await waitForRedis();

})
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", {
      promise,
      reason,
    });
  });