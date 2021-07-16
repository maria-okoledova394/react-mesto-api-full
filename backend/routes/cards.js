const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const BadRequestError = require('../errors/bad-request');

const method = (value) => {
  const result = validator.isURL(value, {
    require_protocol: true,
  });
  if (result) {
    return value;
  }
  throw new BadRequestError('Некорректные введенные данные');
};

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30)
      .label('Некорректные введенные данные'),
    link: Joi.string().required().custom(method).label('Некорректные введенные данные'),
  }),
}), createCard);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).label('Невалидный id'),
  }),
}), deleteCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).label('Невалидный id'),
  }),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).label('Невалидный id'),
  }),
}), dislikeCard);

module.exports = router;
