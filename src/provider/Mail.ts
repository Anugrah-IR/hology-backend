import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Locals from './Locals';
import logger from './Winston';

export default async function sendMail(
  userName: string,
  subjects: string,
  messages: string,
  link: string
) {
  // TODO: check performance
  const transporter: nodemailer.Transporter = nodemailer.createTransport({
    host: Locals.config().mail_host,
    port: parseInt(Locals.config().mail_port),
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: Locals.config().mail_user,
      pass: Locals.config().mail_pass,
    },
    logger: false,
  });

  const mail_user = Locals.config().mail_user;

  // TODO: better templates
  const mailOptions: Mail.Options = {
    from: `HOLOGY 5.0 <${mail_user}>`,
    to: userName,
    subject: subjects,
    text: messages,
    html: `<p>${messages}<a href="${link}">Click here</a></p>"`, // html body
  };

  try {
    logger.info(`Sending mail to ${mail_user} with subject ${subjects}`);
    transporter.sendMail(mailOptions);
  } catch (err) {
    logger.error('error sending mail', err);
    throw err;
  }
}
