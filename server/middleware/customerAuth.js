import jwt from 'jsonwebtoken';

export const CUSTOMER_TOKEN_NAME = 'cocoa_customer_token';

const isProd = process.env.NODE_ENV === 'production';

export const customerCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export function signCustomerToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.CUSTOMER_JWT_EXPIRES_IN || '30d' }
  );
}

export function setCustomerCookie(res, user) {
  res.cookie(CUSTOMER_TOKEN_NAME, signCustomerToken(user), customerCookieOptions);
}

export function clearCustomerCookie(res) {
  res.clearCookie(CUSTOMER_TOKEN_NAME, { ...customerCookieOptions, maxAge: undefined });
}

function readToken(req) {
  return (req.cookies && req.cookies[CUSTOMER_TOKEN_NAME]) || null;
}

/** Hard gate: 401 if not a valid customer session. */
export function requireCustomer(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'customer') return res.status(401).json({ message: 'Please log in to continue.' });
    req.customer = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

/** Soft attach: never blocks — sets req.customer when a valid token exists. */
export function attachCustomer(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.role === 'customer') req.customer = payload;
    } catch {
      /* ignore invalid token — treated as guest */
    }
  }
  next();
}

/** Tiny in-memory rate limiter (per IP + bucket). Good enough for a single instance. */
export function rateLimit({ windowMs, max, bucket = 'default', message = 'Too many attempts. Please try again later.' }) {
  const hits = new Map();
  return (req, res, next) => {
    const key = `${bucket}:${req.ip}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ message });
    }
    next();
  };
}
