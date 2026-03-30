const Joi = require('joi');

const userSchemas = {
  signup: Joi.object({
    userName: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('user', 'author', 'admin'),
    categoryIds: Joi.array().items(Joi.number())
  }),
  login: Joi.object({
    email: Joi.string().email(),
    userName: Joi.string().alphanum().min(3).max(30),
    password: Joi.string().required()
  }).xor('email', 'userName'), // Ensures either email or userName is provided, but not both at once (though both is also fine if we change to .or)
  updateProfile: Joi.object({
    bio: Joi.string().max(500),
    avatar: Joi.string().uri(),
    website: Joi.string().uri(),
    location: Joi.string().max(100),
    categoryIds: Joi.array().items(Joi.number())
  })
};

module.exports = userSchemas;
