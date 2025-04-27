import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from 'express'
import type ServerError from '../modules/server_errors/server_error.js'

export const handleError: ErrorRequestHandler = (err: ServerError, req: Request, res: Response, next: NextFunction): void => {
  res.status(err.statusCode).send(err.msgToClient)
  next()
}
