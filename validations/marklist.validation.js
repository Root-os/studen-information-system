const Joi = require('joi');

exports.upsertMarksSchema = {
  body: Joi.object({
    studentId: Joi.number().integer().positive().required(),
    courseId: Joi.number().integer().positive().required(),
    teacherId:Joi.number().integer().positive().required(),
    mark: Joi.number().min(0).max(100).required(),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};
