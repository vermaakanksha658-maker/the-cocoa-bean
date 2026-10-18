import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: 'cafesiteworks@gmail.com', pass: 'lqmlhtvmgylthxxu' },
});

try {
  await transporter.verify();
  console.log('SMTP verify: OK — Gmail credentials sahi hain');

  const info = await transporter.sendMail({
    from: 'Grand Restaurant & Cafe <cafesiteworks@gmail.com>',
    to: 'cafesiteworks@gmail.com',
    subject: 'Test 2 — SMTP check',
    text: 'Agar ye email mili hai toh SMTP bilkul sahi kaam kar raha hai.',
  });
  console.log('SEND OK — message id:', info.messageId);
  console.log('accepted:', JSON.stringify(info.accepted));
  console.log('rejected:', JSON.stringify(info.rejected));
  console.log('response:', info.response);
} catch (e) {
  console.log('ERROR:', e.message);
  if (e.response) console.log('server response:', e.response);
}
