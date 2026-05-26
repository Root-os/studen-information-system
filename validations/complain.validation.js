const Joi = require('joi');

exports.createComplaintSchema = {
  body: Joi.object({
    complainant: Joi.number().integer().positive().required(),
    respondant: Joi.number().integer().positive().required(),
    complaint: Joi.string().min(3).required(),
  }),
};

exports.updateComplaintSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    complaint: Joi.string().min(3).required(),
  }),
};

exports.updateComplaintStatusSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'resolved', 'rejected').required(),
    resolutionNotes: Joi.string().allow('', null),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};
