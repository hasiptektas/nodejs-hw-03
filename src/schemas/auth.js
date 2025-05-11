import Joi from 'joi';
import { emailRegex, passwordRegex } from '../constants/regex.js';

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name should have at least {#limit} characters',
      'string.max': 'Name should have at most {#limit} characters'
    }),

  email: Joi.string()
    .pattern(emailRegex)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.pattern.base': 'Please enter a valid email address'
    }),

  password: Joi.string()
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
    }),

  repeatPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Repeat password is required'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .pattern(emailRegex)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.pattern.base': 'Please enter a valid email address'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required'
    })
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required'
    })
});

export const emailSchema = Joi.object({
  email: Joi.string()
    .pattern(emailRegex)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.pattern.base': 'Please enter a valid email address'
    })
});

export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});