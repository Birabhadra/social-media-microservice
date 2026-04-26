import mongoose from "mongoose";
const searchSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true })

searchSchema.index({ content: "text" })
searchSchema.index({ createdAt: -1 })

export default mongoose.model("Search", searchSchema)

