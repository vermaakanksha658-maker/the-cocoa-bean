import jwt from 'jsonwebtoken';

export const TOKEN_NAME = 'cocoa_token';

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

export const signToken = (admin, expiresIn = process.env.JWT_EXPIRES_IN || '1d') =>
  jwt.sign({ id: admin._id.toString(), username: admin.username }, process.env.JWT_SECRET, { expiresIn });

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  const token =
    (req.cookies && req.cookies[TOKEN_NAME]) || (header && header.startsWith('Bearer ') ? header.slice(7) : null);

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid' });
  }
}