import joi from 'joi';

export const schema = joi.object().keys({
    id: joi.string().length(36),
  name: joi.string().min(3),
});
