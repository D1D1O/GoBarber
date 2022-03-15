import nodemailer from 'nodemailer';
import { resolve }  from 'path';
import mailConfig from '../config/mail';
import exphbs from 'express-handlebars';
//import nodemailerhbs from 'nodemailer-express-handlebars';
import nodemailerhbs from 'nodemailer-handlebars';
import { create } from 'express-handlebars';
//const hbs = require('hbs');



class Mail{
  constructor(){
    const { host, port, secure, auth } = mailConfig;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });

    this.consfigureTemplates();
  }
  consfigureTemplates(){
    const viewPath = resolve(__dirname,'..','app','views','emails');
    //hbs.registerPartials(__dirname + '/views/partials');
    console.log(resolve(viewPath, 'partials'));

    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: create({
          extname: '.hbs',
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          
        }),
        viewPath,
        extName: '.hbs',
      })
    );


  }

  sendMail(message){
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}
export default new Mail();