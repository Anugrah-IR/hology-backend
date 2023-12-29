import {Request, Response} from 'express';
import Responses from '../provider/Responses';
import prisma from '../provider/Client';
import {users} from '@prisma/client';
import {submissionFormValidator} from '../provider/Validators/CompetitionRequestValidator';
import logger from '../provider/Winston';

export default class Competitions {
  public static async getAllCompetitions(req: Request, res: Response) {
    await prisma.competitions
      .findMany({
        select: {
          competition_id: true,
          competition_name: true,
          competition_description: true,
          competition_percentage: true,
        },
      })
      .then(data => {
        Responses.success(res, 200, 'Success', 'Data fetched', data);
      })
      .catch(err => {
        if (err) Responses.error(res, 500, 'Error', 'Internal server error');
      });
  }

  public static async addSubmission(req: Request, res: Response) {
    const user: users = req.user as users;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = req.files as any;
    const team = await prisma.teams.findFirst({
      where: {
        team_lead_id: user.user_id,
      },
    });

    if (!team) {
      return Responses.error(res, 400, 'Error', 'User is not team lead');
    }

    const data = {
      team_id: team.team_id,
      submission_file: files.submission[0].filename,
    };

    if (!(await submissionFormValidator(data))) {
      return Responses.error(
        res,
        400,
        'Error',
        await submissionFormValidator.errors
      );
    }

    await prisma.submission
      .create({
        data: data,
      })
      .then(data => {
        logger.info(`Submission added by ${user.user_fullname}`);
        Responses.success(res, 200, 'Success', 'Data saved', data);
      })
      .catch(err => {
        if (err) Responses.error(res, 500, 'Error', 'Internal server error');
      });
  }
}
