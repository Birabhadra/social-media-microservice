import jwt from "jsonwebtoken"
import crypto from "crypto"
import refreshToken from "../models/refreshToken.js"
import "dotenv/config"
const generateTokens=async(user)=>{
    const accessToken=jwt.sign({
        userId:user._id,
        username:user.username
    },process.env.JWT_SECRET,{expiresIn:'60m'})

    const RefreshToken=crypto.randomBytes(40).toString('hex');
    const expiresAt=new Date();
    expiresAt.setDate(expiresAt.getDate()+7)

    await refreshToken.create({
        token:RefreshToken,
        user:user._id,
        expiresAt
    })

    return {accessToken,refreshToken}
}

export default generateTokens