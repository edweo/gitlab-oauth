import type { Request, Response } from 'express'

export const asyncCall = (req: Request, res: Response,
  cbAsync: (req: Request, res: Response) => Promise<void>,
  cbOnError: (err: Error) => void): void => {
  cbAsync(req, res).catch((err: unknown) => {
    if (err instanceof Error) {
      cbOnError(err)
    }
  })
}
