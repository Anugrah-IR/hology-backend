import {Request, Response} from 'express';
import {
  userValidator,
  loginFormValidator,
  forgotPasswordFormValidator,
  resetPasswordFormValidator,
} from '../provider/Validators/AuthRequestValidator';
import Responses from '../provider/Responses';
import {genSaltSync, hashSync, compareSync} from 'bcryptjs';
import prisma from '../provider/Client';
import {issueUserJwt} from '../provider/Utils';
import sendMail from '../provider/Mail';
import crypto from 'crypto';
import Locals from '../provider/Locals';
import logger from '../provider/Winston';

class Auth {
  public static async register(req: Request, res: Response) {
    // validate request body
    const valid = await userValidator(req.body);
    if (valid) {
      return Responses.error(
        res,
        400,
        'Bad Request',
        await userValidator.errors
      );
    }

    // variables
    const salt: string = genSaltSync(10);
    const password: string = hashSync(req.body.password, salt);
    req.body.password = password;
    req.body.firstname = req.body.fullname.split(' ');

    // check if email already exists
    const user = await prisma.users.findFirst({
      where: {
        user_email: req.body.email,
      },
    });

    if (user) {
      return Responses.error(res, 400, 'Bad Request', {
        email: 'Email already exists',
      });
    }

    // handle institution first
    await prisma.institutions
      .upsert({
        where: {
          institution_name: req.body.institution,
        },
        update: {},
        create: {
          institution_name: req.body.institution,
        },
      })
      .then(async institution => {
        // create the user
        const newUser = await prisma.users.create({
          data: {
            user_fullname: req.body.fullname,
            user_email: req.body.email,
            user_password: req.body.password,
            user_gender: req.body.gender,
            user_birthdate: new Date(req.body.birthdate),
            institutions: {
              connect: {
                institution_id: institution.institution_id,
              },
            },
          },
        });

        // Issue JWT
        const token = issueUserJwt(newUser.user_uuid);

        // Send email
        try {
          await sendMail(
            req.body.email,
            'Registrasi Akun Hology',
            'Selamat, akun Hology kamu berhasil terdaftar! Silahkan klik disini untuk melanjutkan ke halaman login : ',
            'https://hology.ub.ac.id'
          );
        } catch (error) {
          return Responses.error(res, 500, 'Internal Server Error', {
            message: 'Something went wrong',
          });
        }

        newUser.user_password = '';

        logger.info(`User ${newUser.user_fullname} is registered successfully`);

        // return response
        return Responses.success(
          res,
          201,
          'Created',
          'User created successfully',
          {
            user: newUser,
            token: token,
          }
        );
      })
      .catch(error => {
        return Responses.error(res, 500, 'Internal Server Error', {
          error: error,
        });
      });
  }

  public static async login(req: Request, res: Response) {
    // validate request body
    const valid = await loginFormValidator(req.body);
    if (!valid) {
      return Responses.error(
        res,
        400,
        'Bad Request',
        await loginFormValidator.errors
      );
    }

    // check the data from database
    await prisma.users
      .findFirst({
        where: {
          user_email: req.body.email,
        },
        select: {
          user_id: false,
          user_uuid: true,
          user_fullname: true,
          user_email: true,
          user_password: true,
          user_birthdate: true,
          user_gender: true,
          institutions: {
            select: {
              institution_id: false,
              institution_name: true,
            },
          },
          created_at: true,
          updated_at: true,
        },
      })
      .then(user => {
        if (!user) {
          return Responses.error(res, 404, 'Not Found', {
            message: 'Email not found',
          });
        }

        // check password
        const password = compareSync(req.body.password, user.user_password);

        if (!password) {
          return Responses.error(res, 401, 'Unauthorized', {
            message: 'Wrong password',
          });
        }

        // Issue JWT
        const token = issueUserJwt(user.user_uuid);

        user.user_password = 'it is a secret';

        logger.info(`User ${user.user_fullname} is logged in successfully`);

        // return response
        return Responses.success(
          res,
          200,
          'OK',
          'User logged in successfully',
          {
            user: user,
            token: token,
          }
        );
      })
      .catch(error => {
        return Responses.error(res, 500, 'Internal Server Error', {
          error: error,
        });
      });
  }

  public static async forgotPassword(req: Request, res: Response) {
    // validate request body
    const valid = await forgotPasswordFormValidator(req.body);
    if (valid) {
      return Responses.error(
        res,
        400,
        'Bad Request',
        await forgotPasswordFormValidator.errors
      );
    }

    // check if email exists
    const user = await prisma.users.findFirst({
      where: {
        user_email: req.body.email,
      },
    });

    if (!user) {
      return Responses.error(res, 404, 'Not Found', {
        message: 'Email not found',
      });
    }

    // generate token
    const token = crypto.randomBytes(10).toString('hex');
    const link =
      Locals.config().client_forgot_url +
      `?token=${token}&email=${user.user_email}`;

    // save token to database
    await prisma.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        forgot_password_token: token,
      },
    });

    // send email
    try {
      await sendMail(
        user.user_email,
        'Password Reset',
        'Here is your reset password link: ',
        link
      );
    } catch (error) {
      return Responses.error(res, 500, 'Internal Server Error', {
        message: 'Something went wrong',
      });
    }
    logger.info(`User ${user.user_fullname} requested password reset`);
    Responses.success(res, 200, 'OK', 'Email sent successfully', null);
  }

  public static async resetPassword(req: Request, res: Response) {
    // validate request body
    const valid = await resetPasswordFormValidator(req.body);
    if (!valid) {
      return Responses.error(
        res,
        400,
        'Bad Request',
        await resetPasswordFormValidator.errors
      );
    }

    // check if email exists
    const user = await prisma.users.findFirst({
      where: {
        user_email: req.body.email,
      },
    });

    if (!user) {
      return Responses.error(res, 404, 'Not Found', {
        message: 'Email not found',
      });
    }

    // check if token is valid
    if (req.body.token !== user.forgot_password_token) {
      logger.info(
        `User ${user.user_fullname} tried to reset password with invalid token`
      );
      return Responses.error(res, 401, 'Unauthorized', {
        message: 'Invalid token',
      });
    }

    // variables
    const salt: string = genSaltSync(10);
    const password: string = hashSync(req.body.password, salt);

    // update password
    await prisma.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        user_password: password,
        forgot_password_token: 'no-token',
        updated_at: new Date(),
      },
    });

    logger.info(`User ${user.user_fullname} reset password successfully`);

    // return response
    return Responses.success(res, 200, 'OK', 'Password updated successfully', {
      message: 'Please login with your new password',
    });
  }
}

export default Auth;
