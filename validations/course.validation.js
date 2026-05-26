const Joi = require('joi');

exports.createCourseSchema = {
  body: Joi.object({
    courseName: Joi.string().min(2).max(255).required(),
    courseCode: Joi.string().min(2).max(50).required(),
    grade: Joi.string().min(1).max(50).required(),
  }),
};

exports.updateCourseSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    courseName: Joi.string().min(2).max(255).optional(),
    courseCode: Joi.string().min(2).max(50).optional(),
    grade: Joi.string().min(1).max(50).optional(),
  }),
};

exports.enrollSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    studentId: Joi.number().integer().positive().required(),
  }),
};
