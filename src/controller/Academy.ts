import {users} from '@prisma/client';
import {Request, Response} from 'express';
import Responses from '../provider/Responses';
import prisma from '../provider/Client';
import {
  registrationFormValidator,
  presensiFormValidator,
} from '../provider/Validators/AcademyValidator';
import logger from '../provider/Winston';

export default class academy {
  public static async addUserRegistration(req: Request, res: Response) {
    const user: users = req.user as users;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = req.files as any;

    const data = {
      user_id: user.user_id,
      academy_id: parseInt(req.body.academy_id),
      linkedin: req.body.linkedin,
      cv: files.cv[0].filename,
      ktm: files.ktm[0].filename,
      soal: {
        soal1: req.body.soal1,
        soal2: req.body.soal2,
        soal3: req.body.soal3,
        soal4: req.body.soal4,
        soal5: req.body.soal5,
        soal6: req.body.soal6,
        soal7: req.body.soal7,
      },
    };

    // validate
    if (!(await registrationFormValidator(data))) {
      return Responses.error(
        res,
        400,
        'Bad Request',
        await registrationFormValidator.errors
      );
    }

    // check if user is already registered
    const academy = await prisma.academy_registration.findFirst({
      where: {
        user_id: user.user_id,
      },
    });

    if (academy) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'User already registered in academy',
      });
    }

    // register
    await prisma.academy_registration
      .create({
        data: {
          user_id: data.user_id,
          academy_id: data.academy_id,
          linkedin: data.linkedin,
          cv: data.cv,
          ktm: data.ktm,
          soal1: data.soal.soal1,
          soal2: data.soal.soal2,
          soal3: data.soal.soal3,
          soal4: data.soal.soal4,
          soal5: data.soal.soal5,
          soal6: data.soal.soal6,
          soal7: data.soal.soal7,
        },
      })
      .then(data => {
        logger.info(
          `User ${user.user_fullname} is successfully registered to academy`
        );

        return Responses.success(
          res,
          200,
          'Success',
          'User successfully registered in academy',
          data
        );
      });
  }

  public static async getListAcademy(req: Request, res: Response) {
    await prisma.academy
      .findMany({
        select: {
          academy_id: true,
          academy_name: true,
          academy_description: true,
          registration_time_limit: true,
          instructor: {
            select: {
              admin_name: true,
            },
          },
          academy_activity: {
            select: {
              description: true,
              holding_date: true,
            },
          },
        },
      })
      .then(data => {
        return Responses.success(
          res,
          200,
          'Success',
          'Success get list academy',
          data
        );
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });
  }

  public static async addPresensiAcademy(req: Request, res: Response) {
    const user: users = req.user as users;
    if (!(await presensiFormValidator(req.body))) {
      return Responses.error(
        res,
        400,
        'Bad Request',
        await presensiFormValidator.errors
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = req.body as any;

    const registration = await prisma.academy_registration
      .findFirst({
        where: {
          user_id: user.user_id,
        },
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    if (!registration) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'User is not registered in academy',
      });
    }

    // get academy_activity with the exac token_presensi
    const activity = await prisma.academy_activity
      .findFirst({
        where: {
          academy_id: registration.academy_id,
          token_presensi: body.token_presensi,
        },
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    if (!activity) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'Token presensi is not valid',
      });
    }

    // check if user already presensi
    const presensi = await prisma.presensi_academy
      .findFirst({
        where: {
          user_id: user.user_id,
          academy_activity_id: activity.academy_activity_id,
        },
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    if (presensi) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'User already presensi in this activity',
      });
    }

    // add presensi
    const data = await prisma.presensi_academy
      .create({
        data: {
          user_id: user.user_id,
          academy_activity_id: activity.academy_activity_id,
        },
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    logger.info(`User ${user.user_fullname} sukses presensi`, data);

    return Responses.success(
      res,
      200,
      'Success',
      'User successfully presensi',
      data || null
    );
  }
}
