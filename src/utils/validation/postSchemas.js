const Joi = require('joi');

const postSchemas = {
  createPost: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    content: Joi.string().min(10).required(),
    categoryId: Joi.number().required(),
    status: Joi.string().valid('draft', 'published', 'pending', 'rejected')
  }),
  updatePost: Joi.object({
    title: Joi.string().min(5).max(100),
    content: Joi.string().min(10),
    categoryId: Joi.number(),
    status: Joi.string().valid('draft', 'published', 'pending', 'rejected')
  })
};

module.exports = postSchemas;
