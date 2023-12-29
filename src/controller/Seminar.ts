import {users} from '@prisma/client';
import prisma from '../provider/Client';
import {Request, Response} from 'express';
import Responses from '../provider/Responses';
import {
  seminarAttendanceFormValidator,
  seminarRegistrationFormValidator,
} from '../provider/Validators/SeminarRequestValidator';
import sendMail from '../provider/Mail';

export default class Seminar {
  public static async registerParticipant(req: Request, res: Response) {
    const user: users = req.user as users;

    // validate request body
    const valid = await seminarRegistrationFormValidator(req.body);

    if (!valid) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'Invalid request body',
        errors: await seminarRegistrationFormValidator.errors,
      });
    }

    try {
      // check if user already registered in seminar
      const dataUserSeminar = await prisma.user_seminars.findFirst({
        where: {
          user_id: user.user_id,
        },
      });

      if (dataUserSeminar) {
        return Responses.error(res, 400, 'Bad Request', {
          message: 'User already registered in seminar',
        });
      }

      // create new user_seminars
      await prisma.user_seminars
        .create({
          data: {
            user_id: user.user_id,
            ig_story: req.body.story,
          },
        })
        .then(async data => {
          interface registerParticipantResponse {
            user_uuid: string;
            ticket_uuid: string;
            created_at: Date;
          }

          const returnData: registerParticipantResponse = {
            user_uuid: user.user_uuid,
            ticket_uuid: data.ticket_uuid,
            created_at: data.created_at,
          };

          try {
            await sendMail(
              user.user_email,
              'Pendaftaran Seminar Berhasil',
              'Selamat, kamu berhasil terdaftar di Seminar! Kamu bisa cek tiket masukmu di halaman profil kamu.',
              // TODO: add link to ticket page
              'https://hology.ub.ac.id/#/dashboard/store'
            );
          } catch (error) {
            console.log(error);
          }

          return Responses.success(
            res,
            200,
            'OK',
            'User successfully registered in seminar',
            {
              ...returnData,
            }
          );
        });
    } catch (error) {
      return Responses.error(res, 500, 'Internal Server Error', {
        message: 'Internal Server Error',
        error: error,
      });
    }
  }

  public static async addAttendance(req: Request, res: Response) {
    // validate request body
    const valid = seminarAttendanceFormValidator(req.body);

    if (!valid) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'Invalid request body',
        errors: await seminarAttendanceFormValidator.errors,
      });
    }

    const {ticket_uuid} = req.body;
    await prisma.user_seminars
      .update({
        where: {
          ticket_uuid: ticket_uuid,
        },
        data: {
          present: true,
          updated_at: new Date(),
        },
        select: {
          user_id: true,
          ticket_uuid: true,
          present: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              user_id: false,
              user_uuid: true,
              user_fullname: true,
              user_email: true,
              user_birthdate: true,
              user_gender: true,
              user_password: false,
              institutions: {
                select: {
                  institution_id: false,
                  institution_name: true,
                },
              },
            },
          },
        },
      })
      .then(data => {
        return Responses.success(res, 200, 'OK', 'User attendance added', data);
      })
      .catch(error => {
        return Responses.error(res, 400, 'Bad Request', {
          message: 'Invalid ticket uuid',
          detail: error,
        });
      });
  }

  public static async getAllParticipant(req: Request, res: Response) {
    await prisma.user_seminars
      .findMany({
        select: {
          user_id: false,
          ticket_uuid: true,
          present: true,
          ig_story: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              user_id: false,
              user_uuid: true,
              user_fullname: true,
              user_email: true,
              user_birthdate: true,
              user_gender: true,
              user_password: false,
              institutions: {
                select: {
                  institution_name: true,
                },
              },
            },
          },
        },
      })
      .then(data => {
        // rename user_uuid in every object to id
        const newData = data.map(item => {
          return {
            id: item.ticket_uuid,
            present: item.present,
            ig_story: item.ig_story,
            created_at: item.created_at,
            updated_at: item.updated_at,
            user: {
              id: item.user.user_uuid,
              fullname: item.user.user_fullname,
              email: item.user.user_email,
              birthdate: item.user.user_birthdate,
              gender: item.user.user_gender,
              institution: item.user.institutions.institution_name,
            },
          };
        });

        res.set('Content-Range', data.length.toString());
        res.status(200).json(newData);

        // return Responses.success(res, 200, 'OK', 'All participants', {
        //   daftar_peserta: data,
        // });
      })
      .catch(error => {
        if (error)
          return Responses.error(res, 500, 'Internal Server Error', {
            message: 'Internal Server Error',
            error: error,
          });
      });
  }

  public static async getOneParticipant(req: Request, res: Response) {
    const {ticket_uuid} = req.params;

    await prisma.user_seminars
      .findUnique({
        where: {
          ticket_uuid: ticket_uuid,
        },
        select: {
          user_id: false,
          ticket_uuid: true,
          present: true,
          ig_story: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              user_uuid: true,
              user_fullname: true,
              user_email: true,
              user_birthdate: true,
              user_gender: true,
              institutions: {
                select: {
                  institution_name: true,
                },
              },
            },
          },
        },
      })
      .then(data => {
        const newData = data
          ? {
              id: data.ticket_uuid,
              present: data.present,
              ig_story: data.ig_story,
              created_at: data.created_at,
              updated_at: data.updated_at,
              user: {
                id: data.user.user_uuid,
                fullname: data.user.user_fullname,
                email: data.user.user_email,
                birthdate: data.user.user_birthdate,
                gender: data.user.user_gender,
                institution: data.user.institutions.institution_name,
              },
            }
          : null;
        res.status(200).json(newData);
        // return Responses.success(res, 200, 'OK', 'Participant', data);
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });
  }
}
