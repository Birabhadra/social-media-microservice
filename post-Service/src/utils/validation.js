import Joi from "joi"

const validateCreatePost=(data)=>{
    const Schema=Joi.object({
        content:Joi.string().required(),
        mediaIds:Joi.array().items(Joi.string())
    })

    return Schema.validate(data)
}

export {
    validateCreatePost
}