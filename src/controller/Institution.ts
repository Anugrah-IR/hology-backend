import Responses from '../provider/Responses';
import {Request, Response} from 'express';
import prisma from '../provider/Client';

export default class Institution {
  public static async getAllInstitutions(req: Request, res: Response) {
    await prisma.institutions
      .findMany()
      .then(institutions => {
        return Responses.success(
          res,
          200,
          'OK',
          'Institutions fetched successfully',
          {
            institutions,
          }
        );
      })
      .catch(err => {
        if (err) return Responses.error(res, 500, 'Internal Server Error', err);
      });
  }
}
