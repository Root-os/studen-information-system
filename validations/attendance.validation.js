const Joi = require('joi');

exports.createAttendanceSchema = {
  body: Joi.object({
    courseId: Joi.number().integer().positive().required(),
    date: Joi.date().required(),
    records: Joi.array()
      .items(
        Joi.object({
          studentId: Joi.number().integer().positive().required(),
          attendance: Joi.string().valid('PRESENT', 'ABSENT').required(),
        })
      )
      .min(1)
      .required(),
  }),
};

exports.updateAttendanceSchema = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
  body: Joi.object({
    attendance: Joi.string().valid('PRESENT', 'ABSENT').required(),
  }),
};

exports.idParam = {
  params: Joi.object({ id: Joi.number().integer().positive().required() }),
};
