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
    throw new ForbiddenError('Необходима авторизация');
  }

  const token = extractBearerToken(authorization);
  let payload;

  console.log(jwt.verify(token, 'bad-secret-key'));

  try {
    payload = jwt.verify(token, secretKey);
  } catch (e) {
    let error = e;
    if (!(error.name === 'ForbiddenError')) {
      error = new UnauthorizedError('Ошибка авторизации');
    }
    next(error);
  }

  req.user = payload;
  next();
};
