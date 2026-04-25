import Joi from "joi"

const validateRegistration=(data)=>{
    const Schema=Joi.object({
        username:Joi.string().min(3).max(50).required(),
        email:Joi.string().email().required(),
        password:Joi.string().min(6).required()
    })

    return Schema.validate(data)
}
const validateLogin=(data)=>{
    const Schema=Joi.object({
        email:Joi.string().email().required(),
        password:Joi.string().min(6).required()
    })
    return Schema.validate(data)
}

export {
    validateRegistration,
    validateLogin
}