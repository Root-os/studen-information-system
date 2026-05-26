const Joi = require('joi');

exports.createEnrollmentSchema = {
  body: Joi.object({
    studentId: Joi.number().integer().positive().required(),
    courseId: Joi.number().integer().positive().required(),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};

exports.byStudentParam = {
  params: Joi.object({ studentId: Joi.number().integer().positive().required() }),
};

exports.byCourseParam = {
  params: Joi.object({ courseId: Joi.number().integer().positive().required() }),
};
