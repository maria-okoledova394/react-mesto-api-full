require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized');
const InternalServerError = require('../errors/internal-server-error');
const BadRequestError = require('../errors/bad-request');
const ConflictError = require('../errors/conflict');

const { NODE_ENV, JWT_SECRET } = process.env;
const secretKey = NODE_ENV === 'production' ? JWT_SECRET : 'bad-secret-key';

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        secretKey,
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((e) => {
      let error = e;
      if (!(error.name === 'UnauthorizedError')) {
        error = new InternalServerError('На сервере произошла ошибка');
      }

      next(error);
    });
};

module.exports.getProfileInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      } else {
        res.send({
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          _id: user._id,
          email: user.email,
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

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(() => {
      const error = new InternalServerError('На сервере произошла ошибка');
      next(error);
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      } else {
        res.send({
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          _id: user._id,
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

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      req.body.password = hash;
      return User.create(req.body);
    })
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
      email: user.email,
    }))
    .catch((e) => {
      let error = e;
      if (e.name === 'ValidationError') {
        error = new BadRequestError('Некорректные введенные данные');
      } else if (e.name === 'MongoError') {
        error = new ConflictError('Пользователь с таким email уже существует');
      } else {
        error = new InternalServerError('На сервере произошла ошибка');
      }
      next(error);
    });
};

module.exports.updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
      });
    })
    .catch((e) => {
      let error = e;
      if (!(error.name === 'NotFoundError')) {
        if (e.name === 'CastError') {
          error = new BadRequestError('Невалидный id');
        } else if (e.name === 'ValidationError') {
          error = new BadRequestError('Некорректные введенные данные');
        } else {
          error = new InternalServerError('На сервере произошла ошибка');
        }
      }
      next(error);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
      });
    })
    .catch((e) => {
      let error = e;
      if (!(error.name === 'NotFoundError')) {
        if (e.name === 'CastError') {
          error = new BadRequestError('Невалидный id');
        } else if (e.name === 'ValidationError') {
          error = new BadRequestError('Некорректные введенные данные');
        } else {
          error = new InternalServerError('На сервере произошла ошибка');
        }
      }
      next(error);
    });
};
