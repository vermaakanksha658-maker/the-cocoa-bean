import crypto from 'crypto';
import User from '../models/User.js';
import {
  setCustomerCookie,
  clearCustomerCookie,
  requireCustomer,
} from '../middleware/customerAuth.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  appUrl,
} from '../utils/mailer.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

async function issueVerification(user) {
  const { token, hash, expires } = user.createToken(24 * 60); // 24 hours
  user.verifyTokenHash = hash;
  user.verifyTokenExpires = expires;
  await user.save();
  return sendVerificationEmail(user, token);
}

export const register = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name) return res.status(400).json({ message: 'Please tell us your name.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (password.length > 72) return res.status(400).json({ message: 'Password is too long.' });

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.googleId && !existing.passwordHash) {
        return res.status(409).json({ message: 'This email uses Google sign-in. Please continue with Google.' });
      }
      return res.status(409).json({ message: 'An account with this email already exists. Please log in.' });
    }

    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();

    let mail;
    try {
      mail = await issueVerification(user);
    } catch (mailError) {
      // Roll back the brand-new account so a retry isn't blocked by a
      // half-finished registration that never received its verification email.
      await User.deleteOne({ _id: user._id }).catch(() => {});
      console.error('[register] verification email failed:', mailError.message);
      return res.status(503).json({
        message: 'We could not send the verification email right now. Please try again in a few minutes.',
      });
    }

    return res.status(201).json({
      message: 'Verification email sent — please check your inbox and click the link to activate your account.',
      ...(process.env.NODE_ENV !== 'production'
        ? {
            ...(mail.preview ? { devPreviewUrl: mail.preview } : {}),
            ...(mail.link ? { devVerifyLink: mail.link } : {}),
          }
        : {}),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists. Please log in.' });
    }
    console.error('[register] unexpected error:', error.message);
    return res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    const ok = user && (await user.comparePassword(password));
    if (!ok) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email first. Check your inbox for the verification link.',
        email: user.email,
      });
    }

    setCustomerCookie(res, user);
    return res.json({ user: user.publicProfile() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  clearCustomerCookie(res);
  res.json({ ok: true });
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.customer.id);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    res.json({ user: user.publicProfile() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = String(req.query.token || '');
    if (!token) return res.status(400).json({ message: 'Verification link is missing its token.' });

    const hash = sha256(token);
    const user = await User.findOne({ verifyTokenHash: hash, verifyTokenExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
    }

    user.emailVerified = true;
    user.verifyTokenHash = null;
    user.verifyTokenExpires = null;
    await user.save();

    setCustomerCookie(res, user);
    return res.json({ user: user.publicProfile(), message: 'Email verified — thank you!' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    let user = null;
    if (req.customer?.id) {
      user = await User.findById(req.customer.id);
    } else {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (EMAIL_RE.test(email)) {
        user = await User.findOne({ email });
      }
    }
    if (!user) {
      return res.json({ message: 'If an account exists for that email, a verification email is on its way.' });
    }
    if (user.emailVerified) return res.json({ message: 'Your email is already verified.' });
    const mail = await issueVerification(user);
    return res.json({
      message: 'Verification email sent — please check your inbox.',
      ...(process.env.NODE_ENV !== 'production'
        ? {
            ...(mail.preview ? { devPreviewUrl: mail.preview } : {}),
            ...(mail.link ? { devVerifyLink: mail.link } : {}),
          }
        : {}),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const generic = { message: 'If an account exists for that email, a reset link is on its way.' };
    const user = await User.findOne({ email });
    if (!user) return res.json(generic);

    const { token, hash, expires } = user.createToken(60); // 1 hour
    user.resetTokenHash = hash;
    user.resetTokenExpires = expires;
    await user.save();
    const mail = await sendPasswordResetEmail(user, token);

    return res.json({
      ...generic,
      ...(mail.dev && process.env.NODE_ENV !== 'production' ? { devResetLink: mail.link } : {}),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    if (!token) return res.status(400).json({ message: 'Reset link is missing its token.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (password.length > 72) return res.status(400).json({ message: 'Password is too long.' });

    const hash = sha256(token);
    const user = await User.findOne({ resetTokenHash: hash, resetTokenExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    await user.setPassword(password);
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();

    clearCustomerCookie(res);
    return res.json({ message: 'Password updated — please log in with your new password.' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/* ---------------- Google OAuth ---------------- */

export const googleStart = (req, res) => {
  const { GOOGLE_CLIENT_ID } = process.env;
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: 'Google sign-in is not configured yet.' });
  }
  const state = crypto.randomBytes(24).toString('hex');
  res.cookie('cb_google_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 10 * 60 * 1000,
  });
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || appUrl('/api/auth/google/callback'),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

export const googleCallback = async (req, res) => {
  const frontend = appUrl('/');
  try {
    const { code, state } = req.query;
    const savedState = req.cookies?.cb_google_state;
    res.clearCookie('cb_google_state', { path: '/' });

    if (!state || !savedState || state !== savedState) {
      return res.redirect(`${frontend}?auth=google-failed`);
    }
    if (!code) {
      return res.redirect(`${frontend}?auth=google-cancelled`);
    }

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${frontend}?auth=google-failed`);
    }

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || appUrl('/api/auth/google/callback'),
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[google] token exchange failed:', tokenData);
      return res.redirect(`${frontend}?auth=google-failed`);
    }

    const infoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const info = await infoRes.json().catch(() => ({}));
    if (!infoRes.ok || !info.email) {
      return res.redirect(`${frontend}?auth=google-failed`);
    }

    const email = String(info.email).toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: info.name || email.split('@')[0],
        email,
        googleId: info.sub,
        avatar: info.picture || '',
        emailVerified: true,
      });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = info.sub;
      if (!user.avatar && info.picture) user.avatar = info.picture;
      if (!user.emailVerified) user.emailVerified = true;
      await user.save();
    }

    setCustomerCookie(res, user);
    return res.redirect(`${frontend}?auth=google-ok`);
  } catch (error) {
    console.error('[google] callback error:', error.message);
    return res.redirect(`${frontend}?auth=google-failed`);
  }
};

export { requireCustomer };
