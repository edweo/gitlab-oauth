import { type Request, type Response, type NextFunction } from 'express'
import { type SessionServer } from '../modules/session/session_server.js'

export const checkFlashMessage = (req: Request, res: Response, next: NextFunction): void => {
  const session: SessionServer = req.session

  if (session.flash_shown_times === 0) {
    next()
    session.flash_shown_times++
  } else if (session.flash_shown_times === 1) {
    resetFlashMessage(session)
    next()
  } else {
    next()
  }
}

const resetFlashMessage = (session: SessionServer): void => {
  session.flash_message = undefined
  session.flash_shown_times = undefined
  session.flash_message_color = undefined
}
