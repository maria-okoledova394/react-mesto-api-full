const router = require('express').Router();
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUser,
  updateProfile,
  updateAvatar,
  getProfileInfo,
} = require('../controllers/users');
const BadRequestError = require('../errors/bad-request');

const method = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new BadRequestError('Некорректные введенные данные');
};

router.get('/', getUsers);

router.get('/me', getProfileInfo);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).label('Невалидный id'),
  }),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).label('Некорректные введенные данные'),
    about: Joi.string().min(2).max(30).label('Некорректные введенные данные'),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(method).label('Некорректные введенные данные'),
  }),
}), updateAvatar);

module.exports = router;
