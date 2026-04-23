import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config()
import dns from "dns"
dns.setServers(['8.8.8.8'])
const connectMongo=async()=>{
    if(!process.env.MONGODB_URI){
        throw new Error("MongoDB Uri is missing")
    }
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        logger.info("MongoDB connected successfully")
    }catch(err){
        logger.error("Mongoose client error:",err.message);
        process.exit(1)
    }
}

export default connectMongo;