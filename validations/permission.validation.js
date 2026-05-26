const Joi = require('joi');

exports.createPermissionSchema = {
  body: Joi.object({
    userId: Joi.number().integer().positive().required(),
    type: Joi.string().valid('LEAVE', 'VISIT', 'MEDICAL', 'OTHER').required(),
    reason: Joi.string().min(3).required(),
    fromDate: Joi.date().required(),
    toDate: Joi.date().optional(),
    notes: Joi.string().allow('', null),
  }),
};

exports.updatePermissionSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    type: Joi.string().valid('LEAVE', 'VISIT', 'MEDICAL', 'OTHER'),
    reason: Joi.string().min(3),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    notes: Joi.string().allow('', null),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};
