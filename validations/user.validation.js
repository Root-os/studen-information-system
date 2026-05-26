const Joi = require('joi');

exports.updateUserSchema = {
  body: Joi.object({
    fullName: Joi.string().min(3).max(255).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().max(30).allow(null, ''),
  }),
};
