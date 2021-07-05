const Joi = require('joi');

    function validation(student) {
    const schema = Joi.object({
        course : Joi.string().min(3).max(10).required(),
        Name : Joi.string().min(3).max(20).required(),
        id : Joi.number().integer().min(100).max(999).required(),
        email : Joi.string().email({minDomainSegments:2, tlds: {allow: ['com', 'net']}}),
        password: Joi.string().min(3).max(8).required()
    });
    return schema.validate(student); 
}
module.exports = {validation};