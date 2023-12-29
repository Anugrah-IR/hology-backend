import {Request, Response} from 'express';
import Responses from '../provider/Responses';
import prisma from '../provider/Client';
import {users} from '@prisma/client';
import {userUpdateFormValidator} from '../provider/Validators/UserRequestValidator';
import logger from '../provider/Winston';

export default class User {
  public static async getUserProfile(req: Request, res: Response) {
    const user: users = req.user as users;
    await prisma.users
      .findUnique({
        where: {
          user_uuid: user.user_uuid,
        },
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
          seminar: {
            select: {
              ticket_uuid: true,
              ig_story: true,
              present: true,
            },
          },
          academy_registration: {
            select: {
              academy: {
                select: {
                  academy_name: true,
                  academy_description: true,
                },
              },
              linkedin: true,
              cv: true,
              ktm: true,
              status: true,
              created_at: true,
            },
          },
          leader_of_team: {
            select: {
              team_name: true,
              team_payment_proof: true,
              team_biodata: true,
              team_status: true,
              join_token: true,
              competitions: {
                select: {
                  competition_name: true,
                  competition_percentage: true,
                },
              },
              detail_teams: {
                select: {
                  users: {
                    select: {
                      user_fullname: true,
                      user_email: true,
                      user_gender: true,
                    },
                  },
                },
              },
            },
          },
          member_of_teams: {
            select: {
              teams: {
                select: {
                  team_name: true,
                  team_status: true,
                  competitions: {
                    select: {
                      competition_name: true,
                      competition_percentage: true,
                    },
                  },
                  team_leader: {
                    select: {
                      user_fullname: true,
                      user_email: true,
                    },
                  },
                },
              },
            },
          },
          created_at: true,
          updated_at: true,
        },
      })
      .then(data => {
        logger.info(`Success fetching user ${user.user_fullname} profile`);
        return Responses.success(res, 200, 'OK', 'User profile', data);
      })
      .catch(err => {
        return Responses.error(res, 500, 'Internal Server Error', err);
      });
  }

  public static async updateUser(req: Request, res: Response) {
    const user: users = req.user as users;
    const user_uuid = user.user_uuid || req.params.user_uuid;
    const valid = await userUpdateFormValidator(req.body);
    if (!valid) {
      return Responses.error(
        res,
        400,
        'Bad Request',
        await userUpdateFormValidator.errors
      );
    }

    // upsert institution
    const institution = await prisma.institutions.upsert({
      where: {
        institution_name: req.body.institution,
      },
      update: {},
      create: {
        institution_name: req.body.institution,
      },
    });

    await prisma.users
      .update({
        where: {
          user_uuid: user_uuid,
        },
        data: {
          user_fullname: req.body.fullname,
          user_birthdate: new Date(req.body.birthdate),
          user_gender: req.body.gender,
          updated_at: new Date(),
          institutions: {
            connect: {
              institution_id: institution.institution_id,
            },
          },
        },
        include: {
          institutions: {
            select: {
              institution_name: true,
            },
          },
        },
      })
      .then(data => {
        logger.info(`Success updating user ${user.user_fullname} profile`);
        return Responses.success(res, 200, 'OK', 'User updated', data);
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });
  }
}
