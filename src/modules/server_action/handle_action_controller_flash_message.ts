import type ActionResult from './action_result.js'
import { handleActionResult } from './handle_action_result.js'
import type ServerError from '../server_errors/server_error.js'
import { setFlashMessageError } from '../session/set_flash_message.js'
import { type Response, type Request } from 'express'

export const handleActionControllerFlashMessage = async <T> (actionResult: ActionResult<T>,
  req: Request, res: Response, cbController: (result: T) => Promise<void>): Promise<void> => {
  await handleActionResult(actionResult,
    async (result: T) => {
      await cbController(result)
    },
    async (serverError: ServerError) => {
      setFlashMessageError(req.session, serverError.msgToClient)
      res.redirect(req.originalUrl)
    }
  )
}
