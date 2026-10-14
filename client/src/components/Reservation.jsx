import { useEffect, useMemo, useRef, useState } from 'react';
import useInView from '../hooks/useInView.js';
import { useCustomer } from '../customer/useCustomer.jsx';
import './Reservation.css';

const initial = { name: '', phone: '', date: '', time: '', guests: '2', occasion: '' };

const GUEST_OPTIONS = ['1', '2', '3', '4', '5', '6'];

const OCCASIONS = ['Family dining', 'Birthday', 'Kitty party', 'Corporate', 'Coffee date'];

const HERO_IMG =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?fm=jpg&q=80&w=800&auto=format&fit=crop';
const BG_IMG =
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?fm=jpg&q=80&w=1600&auto=format&fit=crop';

const TRUST = ['Instant confirmation', 'No prepayment', 'Free cancellation'];

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function DoneCheck() {
  return (
    <svg className="reserve-check" viewBox="0 0 52 52" aria-hidden="true">
      <circle className="reserve-check-circle" cx="26" cy="26" r="23" />
      <path className="reserve-check-mark" d="M15.5 27.5l7.8 7.8L37 20.5" />
    </svg>
  );
}

function Confetti() {
  const bits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <div className="reserve-confetti" aria-hidden="true">
      {bits.map((i) => (
        <span key={i} style={{ '--i': i }}></span>
      ))}
    </div>
  );
}

function StepIcon({ n, state }) {
  if (state === 'done') {
    return (
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6.5 9.2 17.3 4 12.1" />
      </svg>
    );
  }
  return <span className="reserve-step-num">{n}</span>;
}

export default function Reservation() {
  const { customer, openAuth, beginPending } = useCustomer();
  const [form, setForm] = useState(initial);
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [slots, setSlots] = useState([]);
  const [slotsStatus, setSlotsStatus] = useState('empty'); // empty | loading | ready
  const [takenArr, setTakenArr] = useState([]);
  const [slotError, setSlotError] = useState('');
  const [formError, setFormError] = useState('');
  const [ref, inView] = useInView();
  const prevDate = useRef('');
  const formRef = useRef(form);
  const submitRef = useRef(null);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (formError) setFormError('');
  };

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Pre-fill name/phone from the account once logged in.
  useEffect(() => {
    if (!customer) return;
    setForm((f) => ({
      ...f,
      name: f.name || customer.name || '',
      phone: f.phone || customer.phone || '',
    }));
  }, [customer]);

  useEffect(() => {
    if (!form.date) {
      setSlots([]);
      setTakenArr([]);
      setSlotsStatus('empty');
      return;
    }
    let cancelled = false;
    setSlotsStatus('loading');
    setSlotError('');
    fetch(`/api/reservations/slots?date=${encodeURIComponent(form.date)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('bad response'))))
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots || []);
        setTakenArr(data.taken || []);
        setSlotsStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setSlotsStatus('ready');
        setSlotError('Could not load time slots — your date might still be bookable.');
      });
    return () => {
      cancelled = true;
    };
  }, [form.date]);

  useEffect(() => {
    if (prevDate.current && prevDate.current !== form.date) {
      setForm((f) => ({ ...f, time: '' }));
    }
    prevDate.current = form.date;
  }, [form.date]);

  const submit = async (e) => {
    e?.preventDefault();

    if (state === 'loading') return;

    const missing = [];
    if (!form.name.trim()) missing.push('your name');
    if (!/^[0-9+ ]{8,15}$/.test(form.phone.trim())) missing.push('a valid phone number');
    if (!form.date) missing.push('a date');
    if (!form.time) missing.push('a time slot');

    if (missing.length > 0) {
      setFormError(`Please add ${missing.join(', ')}.`);
      setSlotError('');
      const firstEmpty = document.querySelector(
        missing.includes('your name')
          ? '.reserve-form input[type=text]'
          : missing.includes('a valid phone number')
            ? '.reserve-form input[type=tel]'
            : missing.includes('a date')
              ? '.reserve-date-row input[type=date]'
              : '.reserve-slots'
      );
      if (firstEmpty) firstEmpty.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!customer) {
      beginPending('reservation');
      openAuth({ tab: 'login', reason: 'Login to reserve your table' });
      return;
    }

    setFormError('');
    setState('loading');
    setSlotError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setForm({ ...form, time: '' });
        setTakenArr((prev) => [...new Set([...prev, form.time])]);
        setSlotError(data.message || 'That time was just taken — please pick another.');
        setState('idle');
        return;
      }
      if (!res.ok) throw new Error('Network error');
      setState('done');
    } catch {
      setState('error');
    }
  };

  const pickSlot = (t) => {
    setForm({ ...form, time: t });
    setSlotError('');
    setFormError('');
  };

  // Keep refs fresh so the pending-continue listener always sees latest state.
  useEffect(() => {
    submitRef.current = submit;
  });

  // Auto-submit the stored booking once the customer is logged in.
  useEffect(() => {
    const onContinue = (e) => {
      if (e.detail?.type === 'reservation') submitRef.current?.();
    };
    window.addEventListener('cb:continue', onContinue);
    return () => window.removeEventListener('cb:continue', onContinue);
  }, []);

  const takenTimes = useMemo(() => new Set(takenArr), [takenArr]);
  const selectedTaken = form.time && takenTimes.has(form.time);

  const detailsDone = form.name.trim() !== '' && form.phone.trim() !== '';
  const timeDone = form.date !== '' && form.time !== '' && !selectedTaken;

  const steps = [
    { key: 'details', label: 'Details', done: detailsDone },
    { key: 'time', label: 'Time', done: timeDone },
    { key: 'confirm', label: 'Confirm', done: state === 'done' },
  ];
  const stepIndex = steps.filter((s) => s.done).length;
  const progress = (stepIndex / steps.length) * 100;

  const availableCount = slots.length - takenArr.length;
  const takenCount = takenArr.length;

  const quickDates = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const saturday = new Date(today);
    saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7 || 7));
    return [
      { label: 'Today', value: isoDate(today) },
      { label: 'Tomorrow', value: isoDate(tomorrow) },
      { label: 'Saturday', value: isoDate(saturday) },
    ];
  }, []);

  const minDate = useMemo(() => isoDate(new Date()), []);

  const blockedReason =
    state === 'loading'
      ? ''
      : !form.date
        ? 'Pick a date to see available times'
        : slotsStatus === 'loading'
          ? 'Checking available times…'
          : !form.time
            ? 'Choose a time slot above'
            : selectedTaken
              ? 'That time is already booked'
              : '';

  const resetAll = () => {
    setForm(initial);
    setState('idle');
    setSlots([]);
    setTakenArr([]);
    setSlotsStatus('empty');
    setSlotError('');
    setFormError('');
    prevDate.current = '';
  };

  return (
    <section id="reserve" className="section-pad reserve">
      <div className="reserve-bg" aria-hidden="true">
        <div
          className="reserve-bg-img"
          style={{ backgroundImage: `url(${BG_IMG})` }}
        ></div>
        <div className="reserve-bg-wash"></div>
        <span className="reserve-bg-glow"></span>
        <span className="reserve-bg-glow reserve-bg-glow-2"></span>
        <span className="reserve-bg-beans">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <span key={n} style={{ '--i': n }}></span>
          ))}
        </span>
      </div>

      <div className="container reserve-grid">
        <div className={`reserve-intro reveal reveal-left ${inView ? 'in-view' : ''}`} ref={ref}>
          <img className="reserve-intro-img" src={HERO_IMG} alt="A reserved table at Grand Restaurant & Cafe" loading="lazy" />
          <span className="kicker">save your seat</span>
          <h2 className="section-title reserve-title">Reserve a Corner</h2>
          <p className="reserve-sub">
            A quiet table for family dinners, or a lively corner for celebrations — tell us when and we&rsquo;ll
            keep the welcome warm.
          </p>
          <ul className="reserve-trust">
            {TRUST.map((t) => (
              <li key={t}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6.5 9.2 17.3 4 12.1" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
          <ul className="reserve-points">
            <li>Table held for 15 minutes past your slot</li>
            <li>Groups of 6+ — give us a call</li>
            <li>Cancel free up to 2 hours before</li>
          </ul>
        </div>

        <div className={`reserve-card reveal reveal-right ${inView ? 'in-view' : ''}`}>
          {state === 'done' ? (
            <div className="reserve-done">
              <div className="reserve-done-burst">
                <Confetti />
                <DoneCheck />
              </div>
              <h3>You’re booked!</h3>
              <p>
                Thanks {form.name.split(' ')[0]} — {form.guests} {form.guests === '1' ? 'guest' : 'guests'}{' '}
                for {form.date} at {form.time}. We’ll be waiting.
              </p>
              <div className="reserve-done-meta">
                <span>{form.date}</span>
                <span>{form.time}</span>
                <span>
                  {form.guests} {form.guests === '1' ? 'guest' : 'guests'}
                </span>
              </div>
              <button className="btn btn-ghost" onClick={resetAll}>
                Make another booking
              </button>
            </div>
          ) : (
            <form className="reserve-form" onSubmit={submit} noValidate>
              <div className={`reserve-login-note ${customer ? 'is-in' : ''}`}>
                {customer ? (
                  <span>
                    Booking as <strong>{customer.name}</strong>
                    {customer.phone ? ` · ${customer.phone}` : ''}
                  </span>
                ) : (
                  <>
                    <span>Login to reserve — your name and phone fill in automatically.</span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => openAuth({ tab: 'login', reason: 'Login to reserve your table' })}
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
              <div className="reserve-steps" aria-label="Booking progress">
                {steps.map((s, i) => (
                  <div
                    className={`reserve-step ${s.done ? 'reserve-step-done' : ''} ${i === stepIndex ? 'reserve-step-current' : ''}`}
                    key={s.key}
                  >
                    <span className={`reserve-step-badge ${s.done ? 'reserve-step-fresh' : ''}`} key={s.done ? 'done' : 'idle'}>
                      <span className="reserve-step-face">
                        <StepIcon n={i + 1} state={s.done ? 'done' : 'idle'} />
                      </span>
                    </span>
                    <span className="reserve-step-label">{s.label}</span>
                  </div>
                ))}
                <span className="reserve-progress" aria-hidden="true">
                  <span style={{ width: `${progress}%` }}></span>
                </span>
              </div>

              <div className="reserve-row">
                <label className={formError.includes('your name') ? 'has-error' : ''}>
                  <span>Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your name"
                    aria-label="Name"
                  />
                </label>
                <label className={formError.includes('phone') ? 'has-error' : ''}>
                  <span>Phone</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+91 XXXXX XXXXX"
                    aria-label="Phone"
                  />
                </label>
              </div>

              <div className="reserve-field">
                <span className="reserve-field-label">Date</span>
                <div className="reserve-date-row">
                  <input
                    type="date"
                    min={minDate}
                    value={form.date}
                    onChange={set('date')}
                    aria-label="Date"
                    className={formError.includes('a date') ? 'has-error' : ''}
                  />
                  <div className="reserve-quick">
                    {quickDates.map((q) => (
                      <button
                        type="button"
                        key={q.label}
                        className={`reserve-quick-btn ${form.date === q.value ? 'is-active' : ''}`}
                        onClick={() => setForm({ ...form, date: q.value, time: '' })}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="reserve-field">
                <div className="reserve-slots-head">
                  <span className="reserve-field-label">Pick a time</span>
                  <span className="reserve-slot-meta">
                    {slotsStatus === 'loading'
                      ? 'Checking…'
                      : slotsStatus === 'ready'
                        ? `${availableCount} of ${slots.length} slots open`
                        : 'Pick a date first'}
                  </span>
                </div>

                <span className="reserve-meter" aria-hidden="true">
                  <span
                    style={{ width: slots.length ? `${(availableCount / slots.length) * 100}%` : '0%' }}
                    className={availableCount <= 4 && slots.length ? 'is-low' : ''}
                  ></span>
                </span>

                <div
                  className={`reserve-slots ${formError.includes('time slot') ? 'is-empty' : ''}`}
                >
                  {slotsStatus === 'ready' ? (
                    slots.map((t) => {
                      const unavailable = t !== form.time && takenTimes.has(t);
                      return (
                        <button
                          type="button"
                          key={t}
                          className={`reserve-slot ${form.time === t ? 'reserve-slot-active' : ''} ${unavailable ? 'reserve-slot-taken' : ''}`}
                          disabled={unavailable}
                          onClick={(e) => {
                            pickSlot(t);
                            const btn = e.currentTarget;
                            btn.classList.remove('reserve-slot-press');
                            void btn.offsetWidth;
                            btn.classList.add('reserve-slot-press');
                          }}
                          aria-pressed={form.time === t}
                        >
                          {t}
                        </button>
                      );
                    })
                  ) : slotsStatus === 'loading' ? (
                    <span className="reserve-slot-hint">Checking availability…</span>
                  ) : (
                    <span className="reserve-slot-hint">Choose a date to see available times.</span>
                  )}
                </div>

                {slotsStatus === 'ready' && (
                  <div className="reserve-legend" aria-hidden="true">
                    <span>
                      <i className="legend-open"></i>Open
                    </span>
                    <span>
                      <i className="legend-selected"></i>Selected
                    </span>
                    <span>
                      <i className="legend-taken"></i>Booked{takenCount > 0 ? ` (${takenCount})` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="reserve-field">
                <span className="reserve-field-label">Guests</span>
                <div className="reserve-guests" role="group" aria-label="Number of guests">
                  {GUEST_OPTIONS.map((n) => (
                    <button
                      type="button"
                      key={n}
                      className={`reserve-guest ${form.guests === n ? 'is-active' : ''}`}
                      onClick={() => setForm({ ...form, guests: n })}
                      aria-pressed={form.guests === n}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="8" r="3.4" />
                        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                      </svg>
                      <span>{n}</span>
                    </button>
                  ))}
                  <span className="              reserve-guests-hint">6+? Call us</span>
                </div>
              </div>

              <div className="reserve-field">
                <span className="reserve-field-label">
                  Occasion <small style={{ opacity: 0.7 }}>(optional)</small>
                </span>
                <div className="reserve-guests" role="group" aria-label="Occasion">
                  {OCCASIONS.map((o) => (
                    <button
                      type="button"
                      key={o}
                      className={`reserve-guest reserve-guest-text ${form.occasion === o ? 'is-active' : ''}`}
                      onClick={() => setForm({ ...form, occasion: form.occasion === o ? '' : o })}
                      aria-pressed={form.occasion === o}
                    >
                      <span>{o}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(form.date || form.time) && (
                <div className="reserve-summary">
                  <span className="reserve-summary-label">Your booking</span>
                  <span className="reserve-summary-values">
                    {form.date || 'Date'}
                    <i>·</i>
                    {form.time || 'Time'}
                    <i>·</i>
                    {form.guests} {form.guests === '1' ? 'guest' : 'guests'}
                  </span>
                </div>
              )}

              {formError && (
                <p className="reserve-error reserve-form-error" role="alert">
                  {formError}
                </p>
              )}
              {slotError && <p className="reserve-error">{slotError}</p>}
              {state === 'error' && !slotError && (
                <p className="reserve-error">
                  Couldn’t reach our server right now. Please call us at +91 98XXX XXXXX to book.
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary reserve-btn"
                disabled={state === 'loading'}
              >
                {state === 'loading'
                  ? 'Booking…'
                  : customer
                    ? 'Confirm Reservation'
                    : 'Login to Reserve'}
              </button>
              <p className="reserve-note">
                {state === 'loading'
                  ? 'Confirming your table…'
                  : !customer
                    ? 'Login to confirm your booking.'
                    : blockedReason || 'No advance needed — we hold the table for 15 minutes.'}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
