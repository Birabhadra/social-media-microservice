import mongoose from 'mongoose';
import argon2 from "argon2";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    email:{
        type:String,
        lowercase:true,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }},{
        timestamps:true
})

userSchema.pre('save',async function(){
    if(this.isModified('password')){
        try{
            this.password=await argon2.hash(this.password)

        }catch(err){
            return next(err)
        }
    }

})

userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        return await argon2.verify(this.password,candidatePassword)
    }catch(err){
        throw err
    }
}

userSchema.index({username:'text'})

const User=mongoose.model('User',userSchema)

export default User;