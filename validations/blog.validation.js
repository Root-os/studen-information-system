const Joi = require('joi');

exports.createBlogSchema = {
  body: Joi.object({
    blogDetail: Joi.string().min(3).required(),
    date: Joi.date().required(),
    image: Joi.string().uri().allow('', null),
  }),
};

exports.updateBlogSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    blogDetail: Joi.string().min(3),
    date: Joi.date(),
    image: Joi.string().uri().allow('', null),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};
