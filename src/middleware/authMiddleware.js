import jwt from 'jsonwebtoken';
// import { config } from '../config.js';

/**
 * Middleware для проверки токена авторизации.
 * Если токен отсутствует или истек, то возвращается ошибка.
 */
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).send('Токен отсутствует!');
  }

  try {
    const user = jwt.verify(token, import.meta.env?.SECRET_KEY);
    req.user = user;
    next();
  } catch {
    return res.status(401).send('Неверный или истекший токен!');
  }
};

export default authMiddleware;