import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
      if (res.locals.validationError === 'not_found') {
            res.status(404).send(err.message);
      } else res.status(400).send(err.message);
}
