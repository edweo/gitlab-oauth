import type ActionResult from './action_result.js'
import type ServerError from '../server_errors/server_error.js'
import { actionMessage, errorMessage, errorMessageBold } from '../../server_config/console_messages/console_messages.js'

/**
 * Handle the action result
 * @param actionResult ActionResult object
 * @param cbOnCompleted callback if action was completed
 * @param cbOnError callback if an error occured while performing action
 */
export const handleActionResult = async <T> (actionResult: ActionResult<T>,
  cbOnCompleted: (result: T) => Promise<void>,
  cbOnError: (serverError: ServerError) => Promise<void>): Promise<void> => {
  if (actionResult.serverError === undefined) {
    actionMessage(actionResult.msgToServer)
    await cbOnCompleted(actionResult.result)
  } else {
    errorMessage(actionResult.msgToServer)
    errorMessageBold(actionResult.serverError.msgToServer)
    await cbOnError(actionResult.serverError)
  }
}
