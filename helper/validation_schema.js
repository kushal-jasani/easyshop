const Joi = require("joi");

const loginSchema = Joi.object({
  country_code: Joi.string().required(),
  phoneno: Joi.string().min(10).required(),
});

const registerSchema = Joi.object({
  role: Joi.number().valid(1, 2).required(),
  firstname: Joi.string().when("role", { is: 1, then: Joi.required() }),
  lastname: Joi.string().when("role", { is: 1, then: Joi.required() }),
  email: Joi.string().email().lowercase().required(),
  phoneno: Joi.string().min(10).required(),
  country_code: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")).required(),
  bName: Joi.string().when("role", { is: 2, then: Joi.required() }),
  category: Joi.string().when("role", { is: 2, then: Joi.required() }),
  subcategory: Joi.string().when("role", { is: 2, then: Joi.required() }),
  city: Joi.string().when("role", { is: 2, then: Joi.required() }),
  state: Joi.string().when("role", { is: 2, then: Joi.required() }),
  address: Joi.string().when("role", { is: 2, then: Joi.required() }),
  aadharno: Joi.string().when("role", { is: 2, then: Joi.required() }).length(12)
  .pattern(/^[0-9]+$/, 'numeric'),
  aadharphoto: Joi.string().when("role", { is: 2, then: Joi.required() }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
    .required(),
  confirmPassword: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
    .required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const postResetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
    .required(),
});

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  resetPasswordSchema,
  postResetPasswordSchema,
};
