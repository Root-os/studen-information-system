const Joi = require('joi');

exports.createPunishmentSchema = {
  body: Joi.object({
    studentId: Joi.number().integer().positive().required(),
    reason: Joi.string().min(3).required(),
    action: Joi.string().min(1).required(),
    date: Joi.date().required(),
    status: Joi.string().valid('PENDING', 'ACTIVE', 'APPEALED', 'RESCINDED').optional(),
    issuedBy: Joi.number().integer().positive().allow(null),
  }),
};

exports.updatePunishmentSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    reason: Joi.string().min(3),
    action: Joi.string().min(1),
    date: Joi.date(),
    status: Joi.string().valid('PENDING', 'ACTIVE', 'APPEALED', 'RESCINDED'),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};
