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
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  updateProfile: Joi.object({
    bio: Joi.string().max(500),
    avatar: Joi.string().uri(),
    website: Joi.string().uri(),
    location: Joi.string().max(100),
    categoryIds: Joi.array().items(Joi.number())
  })
};

module.exports = userSchemas;
