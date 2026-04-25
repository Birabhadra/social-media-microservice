import mongoose from "mongoose"

const mediaSchema=new mongoose.Schema({
    publicId:{
        required:true,
        type:String
    },
    originalName:{
        type:String,
        required:true
    },
    mimeType:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

export default mongoose.model("Media",mediaSchema)
