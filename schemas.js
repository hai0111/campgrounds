const Joi = require('joi')

module.exports.camgroundSchema = Joi.object({
	title: Joi.string().required(),
	price: Joi.number().required().min(0),
	image: Joi.string().required(),
	location: Joi.string().required(),
	description: Joi.string().required(),
})
	.required()
	.unknown()

module.exports.reviewSchema = Joi.object({
	rating: Joi.number().required().integer().min(0).max(5).messages({
		'number.base': 'rating phải là 1 số nha',
		'any.required': 'Không được để trống nha',
		'number.integer': 'Phải là một số nguyên nha',
		'number.min': 'Không được nhỏ hơn 0 nha',
		'number.max': 'Không được lớn hơn 5 nha',
	}),
	body: Joi.string().required().messages({
		'string.base': 'body phải là 1 chuỗi nha',
		'any.required': 'Không được để trống nha',
	}),
})
	.required()
	.unknown()
