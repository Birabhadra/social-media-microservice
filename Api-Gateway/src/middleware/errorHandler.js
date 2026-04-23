import logger from "../utils/logger.js"

const errorHandler=(err,req,res,next)=>{
    logger.error(err.stack)
    const status=err.status||500
    return res.status(status).json({
        message:status>=500?"Internal server error" :err.message||"Internal Server Error"
    })
}



export default errorHandler 