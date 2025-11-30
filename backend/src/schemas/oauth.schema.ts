import Joi from 'joi';

// OAuth callback validation
export const oauthCallbackSchema = Joi.object({
    code: Joi.string()
        .required()
        .max(1000)
        .messages({
            'any.required': 'Authorization code is required',
            'string.max': 'Invalid authorization code',
        }),
    state: Joi.string()
        .optional()
        .max(500)
        .messages({
            'string.max': 'Invalid state parameter',
        }),
    error: Joi.string()
        .optional()
        .messages({
            'string.base': 'Invalid error parameter',
        }),
    error_description: Joi.string()
        .optional()
        .messages({
            'string.base': 'Invalid error description',
        }),
});

// Twitter OAuth callback (requires state for PKCE)
export const twitterCallbackSchema = Joi.object({
    code: Joi.string()
        .required()
        .max(1000)
        .messages({
            'any.required': 'Authorization code is required',
        }),
    state: Joi.string()
        .required()
        .max(500)
        .messages({
            'any.required': 'State parameter is required',
            'string.max': 'Invalid state parameter',
        }),
});
