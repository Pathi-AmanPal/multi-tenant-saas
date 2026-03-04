const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .max(50)
    .required(),

  role: Joi.string()
    .valid('USER', 'ADMIN')
    .optional()
});

module.exports = {
  createUserSchema
};