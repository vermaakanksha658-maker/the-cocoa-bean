import nodemailer from 'nodemailer';

const account = await nodemailer.createTestAccount();

console.log('USER=' + account.user);
console.log('PASS=' + account.pass);
