const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const InternalServerError = require('../errors/internal-server-error');
const BadRequestError = require('../errors/bad-request');
const ForbiddenError = require('../errors/forbidden');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(() => {
      const error = new InternalServerError('На сервере произошла ошибка');
      next(error);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({
      name: card.name,
      link: card.link,
      owner: card.owner,
      _id: card._id,
      createdAt: card.createdAt,
      likes: card.likes,
    }))
    .catch((e) => {
      let error = e;
      if (e.name === 'ValidationError') {
        error = new BadRequestError('Некорректные введенные данные');
      } else {
        error = new InternalServerError('На сервере произошла ошибка');
      }
      next(error);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      } else if (req.user._id === card.owner.toString()) {
        return Card.findByIdAndRemove(req.params.cardId)
          .then((deletedCard) => {
            res.send({
              name: deletedCard.name,
              link: deletedCard.link,
              owner: deletedCard.owner,
              _id: deletedCard._id,
              createdAt: deletedCard.createdAt,
              likes: deletedCard.likes,
            });
          });
      } else {
        throw new ForbiddenError('Удалять можно только свои карточки');
      }
    })
    .catch((e) => {
      let error = e;
      if (!(error.name === 'NotFoundError')) {
        if (!(error.name === 'ForbiddenError')) {
          if (e.name === 'CastError') {
            error = new BadRequestError('Невалидный id');
          } else {
            error = new InternalServerError('На сервере произошла ошибка');
          }
        }
      }
      next(error);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      } else {
        res.send({
          name: card.name,
          link: card.link,
          owner: card.owner,
          _id: card._id,
          createdAt: card.createdAt,
          likes: card.likes,
        });
      }
    })
    .catch((e) => {
      let error = e;
      if (!(error.name === 'NotFoundError')) {
        if (e.name === 'CastError') {
          error = new BadRequestError('Невалидный id');
        } else {
          error = new InternalServerError('На сервере произошла ошибка');
        }
      }
      next(error);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      } else {
        res.send({
          name: card.name,
          link: card.link,
          owner: card.owner,
          _id: card._id,
          createdAt: card.createdAt,
          likes: card.likes,
        });
      }
    })
    .catch((e) => {
      let error = e;
      if (!(error.name === 'NotFoundError')) {
        if (e.name === 'CastError') {
          error = new BadRequestError('Невалидный id');
        } else {
          error = new InternalServerError('На сервере произошла ошибка');
        }
      }
      next(error);
    });
};
