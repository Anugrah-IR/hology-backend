/**
 * Define App Locals & Configs
 */

import {Application} from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';

class Locals {
  /*
   * Returns object containing locals and configs
   */
  public static config(): {[key: string]: string} {
    dotenv.config({path: path.join(__dirname, '../../.env')});

    const port = process.env.PORT || '3000';
    const env = process.env.NODE_ENV || 'development';
    const mail_host: string = process.env.MAIL_HOST || 'smtp.gmail.com';
    const mail_port: string = process.env.MAIL_PORT || '587';
    const mail_user: string = process.env.MAIL_USER || 'test@mail.com';
    const mail_pass: string = process.env.MAIL_PASS || 'test';
    const client_forgot_url: string =
      process.env.CLIENT_FORGOT_URL ||
      'https://hology.ub.ac.id/#/new-password/';

    return {
      port,
      env,
      mail_host,
      mail_port,
      mail_user,
      mail_pass,
      client_forgot_url,
    };
  }

  public static init(_express: Application): Application {
    const _config = this.config();
    _express.locals.app = _config;

    return _express;
  }
}

export default Locals;
