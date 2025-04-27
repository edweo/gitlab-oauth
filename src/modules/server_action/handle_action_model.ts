import type ActionResult from './action_result.js'
import { handleActionResult } from './handle_action_result.js'
import type ServerError from '../server_errors/server_error.js'

/**
 * Handle the ActionResult in a model
 * @param actionResult actionResult
 * @param cbModel model callback if no errors occured during the action
 */
export const handleActionModel = async <T> (actionResult: ActionResult<T>, cbModel: (result: T) => Promise<void>): Promise<void> => {
  await handleActionResult(actionResult,
    async (result: T): Promise<void> => {
      await cbModel(result)
    },
    async (serverError: ServerError): Promise<void> => { actionResult.serverError = serverError }
  )
}
