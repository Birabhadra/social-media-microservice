import mongoose from "mongoose"

const postSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"        
    },
    content:{
        type:String,
        required:true,
    },
    mediaIds:[{
        type:String
    }]

},{timestamps:true
});

postSchema.index({content:'text'})

export default mongoose.model("Post",postSchema)