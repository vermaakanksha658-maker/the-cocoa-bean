import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../customer/api.js';
import { useCustomer } from '../customer/useCustomer.jsx';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState('loading'); // loading | ok | error
  const [message, setMessage] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const { setCustomerFromVerify } = useCustomer();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setState('error');
      setMessage('This link is missing its verification token.');
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setState('ok');
        setMessage(res.message || 'Email verified — thank you!');
        setVerifiedUser(res.user || null);
        if (res.user && setCustomerFromVerify) setCustomerFromVerify(res.user);
      })
      .catch((err) => {
        setState('error');
        setMessage(err.message);
      });
  }, [token, setCustomerFromVerify]);

  // After a successful verification, take the user to the site automatically.
  useEffect(() => {
    if (state !== 'ok') return undefined;
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 3000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className="myorders-wrap">
      <h1 className="myorders-title">Email verification</h1>
      {state === 'loading' && <p className="myorders-sub">Verifying your email…</p>}
      {state === 'ok' && (
        <>
          <p className="myorders-sub" style={{ color: '#2f6b46' }}>{message}</p>
          {verifiedUser && (
            <p className="myorders-sub">
              Signed in as <strong>{verifiedUser.name}</strong> ({verifiedUser.email})
            </p>
          )}
          <button type="button" className="btn btn-primary" onClick={() => { window.location.href = '/'; }}>
            Continue to site
          </button>
          <p className="myorders-sub">Taking you to the site…</p>
        </>
      )}
      {state === 'error' && (
        <>
          <p className="myorders-sub" style={{ color: '#b3564f' }}>{message}</p>
          <p className="myorders-sub">Request a new link any time from your account menu.</p>
          <Link to="/" className="btn btn-primary">Back to the cafe</Link>
        </>
      )}
    </div>
  );
}
