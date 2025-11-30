import Joi from 'joi';

// User validation schemas
export const updateUserSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .max(100)
        .optional()
        .messages({
            'string.max': 'Name must not exceed 100 characters',
        }),
    email: Joi.string()
        .email()
        .max(255)
        .optional()
        .messages({
            'string.email': 'Please provide a valid email address',
        }),
});

export const userIdSchema = Joi.object({
    userId: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'Invalid user ID format',
            'any.required': 'User ID is required',
        }),
});
