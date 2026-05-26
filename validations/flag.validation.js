const Joi = require('joi');

exports.createFlagSchema = {
  body: Joi.object({
    userId: Joi.number().integer().positive().required(),
    flagType: Joi.string().min(2).required(),
    severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
    note: Joi.string().allow('', null),
    createdBy: Joi.number().integer().positive().allow(null),
  }),
};

exports.updateFlagSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    flagType: Joi.string().min(2),
    severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH'),
    note: Joi.string().allow('', null),
    active: Joi.boolean(),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};
