import { handleActionResult } from './handle_action_result.js'
import type ServerError from '../server_errors/server_error.js'
import type ActionResult from './action_result.js'
import { type NextFunction } from 'express'

/**
 * Handle the ActionResult in a controller
 * @param actionResult actionResult
 * @param next express next object which will forward to error handler
 * @param cbController controller callback if no errors occured during the action
 */
export const handleActionController = async <T> (actionResult: ActionResult<T>,
  next: NextFunction, cbController: (result: T) => Promise<void>): Promise<void> => {
  await handleActionResult(actionResult,
    async (result: T) => {
      await cbController(result)
    },
    async (serverError: ServerError) => {
      next(serverError)
    }
  )
}
