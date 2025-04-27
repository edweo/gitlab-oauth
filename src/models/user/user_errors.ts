import type ServerError from '../../modules/server_errors/server_error.js'

export const USERNAME_TOO_SHORT: ServerError = { msgToServer: 'Username too short', msgToClient: 'Username too short', statusCode: 400 }
export const PASSWORD_TOO_SHORT: ServerError = { msgToServer: 'Password too short', msgToClient: 'Password too short', statusCode: 400 }
export const USERNAME_AND_PASSWORD_TOO_SHORT: ServerError = { msgToServer: 'Username and Password too short', msgToClient: 'Username or Password too short', statusCode: 400 }
export const WRONG_PASSWORD_AUTHENTICATION: ServerError = { msgToServer: 'Wrong password while authenticating', msgToClient: 'Wrong credentials', statusCode: 400 }
export const USER_DOES_NOT_EXISTS: ServerError = { msgToServer: 'User does not exist', msgToClient: 'Wrong credentials', statusCode: 400 }
export const USER_ALREADY_EXISTS: ServerError = { msgToServer: 'User already exists', msgToClient: 'Username already exists', statusCode: 400 }
export const ERROR_SAVING_USER_IN_DB: ServerError = { msgToServer: 'Error saving user', msgToClient: 'Internal server error', statusCode: 500 }
