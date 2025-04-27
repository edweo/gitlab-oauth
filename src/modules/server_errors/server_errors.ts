import type ServerError from './server_error.js'

export const ERROR_ACCESSING_DB: ServerError = { msgToServer: 'Could not access database', msgToClient: 'Internal server error', statusCode: 500 }
