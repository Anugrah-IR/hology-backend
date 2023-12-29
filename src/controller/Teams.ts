import {Request, Response} from 'express';
import Responses from '../provider/Responses';
import prisma from '../provider/Client';
import {users} from '@prisma/client';
import {
  checkUserAvailabilityFormValidator,
  registerTeamFormValidator,
  uploadTeamProofValidator,
} from '../provider/Validators/TeamsRequestValidator';
import logger from '../provider/Winston';

export default class Teams {
  public static async checkUserIsAvailable(req: Request, res: Response) {
    const user: users = req.user as users;

    // validate
    if (!(await checkUserAvailabilityFormValidator(req.body))) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'Invalid request body',
        errors: await checkUserAvailabilityFormValidator.errors,
      });
    }

    logger.info(
      `user ${user.user_id} is checking user with name ${req.body.user_fullname} availability`
    );

    if (user.user_fullname === req.body.user_fullname) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'User is not available',
      });
    }

    const selectedUser = await prisma.users.findMany({
      where: {
        user_fullname: req.body.user_fullname,
        institution_id: user.institution_id,
      },
      select: {
        user_fullname: true,
        user_uuid: true,
      },
    });

    if (selectedUser.length > 0) {
      return Responses.success(
        res,
        200,
        'OK',
        'User is available',
        selectedUser
      );
    }

    return Responses.error(res, 404, 'Not Found', 'User is not available');
  }

  public static async registerTeam(req: Request, res: Response) {
    // Validate
    const valid = registerTeamFormValidator(req.body);
    if (!valid) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'Invalid request body',
        errors: await registerTeamFormValidator.errors,
      });
    }

    const user: users = req.user as users;

    // check if user is already a team leader
    const isTeamLeader = await prisma.teams
      .findFirst({
        where: {
          team_lead_id: user.user_id,
        },
      })
      .catch(err => {
        if (err) {
          return Responses.error(res, 500, 'Internal Server Error', err);
        }
      });

    if (isTeamLeader) {
      return Responses.error(
        res,
        403,
        'Forbidden',
        'User is already a team leader'
      );
    }

    const member: {user_id: number}[] = [];
    for (const item in req.body.member) {
      const user_data = await prisma.users.findUnique({
        select: {
          user_id: true,
        },
        where: {
          user_uuid: item,
        },
      });
      if (user_data)
        member.push({
          user_id: user_data.user_id,
        });
    }

    // register the team
    await prisma.teams
      .create({
        data: {
          team_name: req.body.team_name,
          team_lead_id: user.user_id,
          institution_id: req.body.institution_id,
          competition_id: req.body.competition_id,
          detail_teams: {
            create: member,
          },
        },
        include: {
          detail_teams: true,
        },
      })
      .then(team => {
        logger.info(
          `team ${team.team_name} is registered by user ${user.user_fullname} : ${user.user_id}`
        );
        return Responses.success(res, 200, 'OK', 'Team is registered', {
          ...team,
        });
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });
  }

  public static async uploadTeamProof(req: Request, res: Response) {
    const user: users = req.user as users;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = req.files as any;

    // check if user is a team leader
    const isTeamLeader = await prisma.teams.findFirst({
      where: {
        team_lead_id: user.user_id,
      },
    });

    if (!isTeamLeader) {
      return Responses.error(
        res,
        403,
        'Forbidden',
        'User is not a team leader'
      );
    }

    const data = {
      team_id: isTeamLeader.team_id,
      team_payment_proof: files.payment_proof[0].filename,
      team_biodata: files.biodata[0].filename,
    };

    // validate
    if (!(await uploadTeamProofValidator(data))) {
      return Responses.error(res, 400, 'Bad Request', {
        message: 'Invalid request body',
        errors: await uploadTeamProofValidator.errors,
      });
    }

    // upload the proof
    await prisma.teams
      .update({
        where: {
          team_id: data.team_id,
        },
        data: {
          team_payment_proof: data.team_payment_proof,
          team_biodata: data.team_biodata,
        },
      })
      .then(team => {
        logger.info(
          `team ${team.team_name} proof is uploaded by user ${user.user_fullname} : ${user.user_id}`
        );
        return Responses.success(res, 200, 'OK', 'Proof is uploaded', {
          ...team,
        });
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });
  }

  public static async joinTeam(req: Request, res: Response) {
    const user: users = req.user as users;
    const token = req.params.token;

    logger.info(
      `user ${user.user_fullname} is joining team with token ${token}`
    );

    // search team by join token
    const team = await prisma.teams
      .findUnique({
        where: {
          join_token: token,
        },
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    if (!team) {
      return Responses.error(res, 404, 'Not Found', 'Team is not found');
    }

    // check if user is already in the team
    const isUserInTeam = await prisma.teams
      .findFirst({
        where: {
          team_id: team.team_id,
          detail_teams: {
            some: {
              user_id: user.user_id,
            },
          },
        },
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    if (isUserInTeam) {
      return Responses.error(
        res,
        403,
        'Forbidden',
        'User is already in the team'
      );
    }

    // check if user is the team leader
    if (user.user_id === team.team_lead_id) {
      return Responses.error(res, 403, 'Forbidden', 'User is the team leader');
    }

    // join the team and make sure team_status set back to WAITING
    await prisma.detail_teams
      .create({
        data: {
          team_id: team.team_id,
          user_id: user.user_id,
        },
      })
      .then(() => {
        // set teams status to WAITING
        return prisma.teams.update({
          where: {
            team_id: team.team_id,
          },
          data: {
            team_status: 'WAITING',
          },
        });
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    logger.info(`user ${user.user_fullname} joined team ${team.team_name}`);
    return Responses.success(res, 200, 'OK', 'User is joined the team', null);
  }

  public static async getTeamDetail(req: Request, res: Response) {
    const user: users = req.user as users;
    const leaded_teams = await prisma.teams
      .findMany({
        where: {
          team_lead_id: user.user_id,
        },
        select: {
          team_name: true,
          team_status: true,
          team_payment_proof: true,
          team_biodata: true,
          join_token: true,
          institutions: {
            select: {
              institution_name: true,
            },
          },
          competitions: {
            select: {
              competition_name: true,
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
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    const joined_teams = await prisma.detail_teams
      .findMany({
        where: {
          user_id: user.user_id,
        },
        select: {
          teams: {
            select: {
              team_id: true,
              team_name: true,
              team_status: true,
              team_payment_proof: true,
              team_biodata: true,
              team_leader: {
                select: {
                  user_fullname: true,
                  user_email: true,
                },
              },
              institutions: {
                select: {
                  institution_name: true,
                },
              },
              competitions: {
                select: {
                  competition_name: true,
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
        },
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });

    logger.info(`user ${user.user_fullname} is getting team detail`);
    return Responses.success(res, 200, 'OK', 'User teams are fetched', {
      leaded_teams,
      joined_teams,
    });
  }
}
