import type ServerError from '../server_errors/server_error.js'

/**
 * Interface to define an action in the server to produce some result and relevant messages
 * to get information if something went wrong
 */
export default interface ActionResult<T> {
  msgToServer: string
  msgToClient?: string
  result: T
  serverError?: ServerError
}
