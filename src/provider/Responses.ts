import {Response} from 'express';

class Responses {
  public static error(
    res: Response,
    code: number,
    status: string,
    message: string | undefined | null | object
  ) {
    res.status(code).json({
      status,
      message,
      data: null,
    });
  }

  public static success(
    res: Response,
    code: number,
    status: string,
    message: string,
    data: object | null
  ) {
    res.status(code).json({
      status,
      message,
      data,
    });
  }
}

export default Responses;
