const Joi = require('joi');

// Validate request with a Joi schema object: { body?, params?, query? }
exports.validate = (schemas = {}) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) return res.status(400).json({ message: 'Validation Error', errors: error.details.map(d => ({ message: d.message, path: d.path })) });
        req.body = value;
      }
      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params, { abortEarly: false, stripUnknown: true });
        if (error) return res.status(400).json({ message: 'Validation Error', errors: error.details.map(d => ({ message: d.message, path: d.path })) });
        req.params = value;
      }
      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query, { abortEarly: false, stripUnknown: true });
        if (error) return res.status(400).json({ message: 'Validation Error', errors: error.details.map(d => ({ message: d.message, path: d.path })) });
        req.query = value;
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

// Common helpers
exports.idParam = Joi.object({ id: Joi.number().integer().positive().required() });
