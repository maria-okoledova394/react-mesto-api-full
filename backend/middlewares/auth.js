require('dotenv').config();
const jwt = require('jsonwebtoken');
const ForbiddenError = require('../errors/forbidden');
const UnauthorizedError = require('../errors/unauthorized');

const extractBearerToken = (header) => header.replace('Bearer ', '');
const { NODE_ENV, JWT_SECRET } = process.env;
const secretKey = NODE_ENV === 'production' ? JWT_SECRET : 'bad-secret-key';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    next (new ForbiddenError('Необходима авторизация'));
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, secretKey);
    req.user = payload;

    next();
  } catch (e) {
    next (new UnauthorizedError('Ошибка авторизации'));
  }
};
