export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure:false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAILPASS,
  },
  default:{
    from: 'Equipe go Barber <noreply@gobarber.com>',
  },
};