import type ActionResult from '../../modules/server_action/action_result.ts'
import { type HydratedDocument } from 'mongoose'
import { type IUser, type IUserMethods, User } from './user.js'
import bcrypt from 'bcrypt'
import type ServerError from '../../modules/server_errors/server_error.js'
import * as modelErrors from './user_errors.js'
import * as serverErrors from '../../modules/server_errors/server_errors.js'
import { handleActionModel } from '../../modules/server_action/handle_action_model.js'
import { type GitlabAccessToken } from '../../http_req_res_interfaces/gitlab_webhook_api.js'

export const authenticateUser = async (username: string, password: string): Promise<ActionResult<boolean>> => {
  const actionResult: ActionResult<boolean> = { msgToServer: `Error authenticating user: ${username}`, result: false, serverError: undefined }

  const userDocument: ActionResult<HydratedDocument<IUser, IUserMethods> | null> = await findOneUserDocument(username)

  await handleActionModel(userDocument, async (result: HydratedDocument<IUser, IUserMethods> | null): Promise<void> => {
    if (result !== null) { // User document found and exist in db with username
      const passwordsMatch: boolean = await bcrypt.compare(password, result.password)
      if (passwordsMatch) {
        actionResult.result = true
        actionResult.msgToServer = `Successfully authenticated user: ${username}`
      } else {
        actionResult.result = false
        actionResult.msgToServer = `Unsuccessful while authenticating user: ${username}`
        actionResult.serverError = modelErrors.WRONG_PASSWORD_AUTHENTICATION
      }
    } else {
      actionResult.serverError = modelErrors.USER_DOES_NOT_EXISTS
    }
  })

  return actionResult
}

export const findOneUserDocument = async (username: string): Promise<ActionResult<HydratedDocument<IUser, IUserMethods> | null>> => {
  const actionResult: ActionResult<HydratedDocument<IUser, IUserMethods> | null> = {
    msgToServer: `Error finding user document: ${username}`,
    result: null,
    serverError: undefined
  }

  try {
    actionResult.result = await User.findOne({ username_lower: username.toLowerCase() })
    actionResult.msgToServer = 'Successfully queried findUser document: ' + username
  } catch (e) {
    actionResult.serverError = serverErrors.ERROR_ACCESSING_DB
  }

  return actionResult
}

export const doesUserExist = async (username: string): Promise<ActionResult<boolean>> => {
  const actionResult: ActionResult<boolean> = { msgToServer: `Error querying doesUserExist: ${username}`, result: false, serverError: undefined }

  try {
    const result: HydratedDocument<IUser, IUserMethods> | null = await User.findOne({ username_lower: username.toLowerCase() })
    actionResult.result = result !== null
    actionResult.msgToServer = 'Successfully queried doesUserExist: ' + username
  } catch (e) {
    actionResult.serverError = serverErrors.ERROR_ACCESSING_DB
  }

  return actionResult
}

export const createNewUser = async (username: string, password: string): Promise<ActionResult<boolean>> => {
  const actionResult: ActionResult<boolean> = { msgToServer: `Error creating new user: ${username}`, result: false, serverError: undefined }

  if (username.length < 3 && password.length < 3) {
    actionResult.serverError = modelErrors.USERNAME_AND_PASSWORD_TOO_SHORT
    return actionResult
  } else if (username.length < 3) {
    actionResult.serverError = modelErrors.USERNAME_TOO_SHORT
    return actionResult
  } else if (password.length < 3) {
    actionResult.serverError = modelErrors.PASSWORD_TOO_SHORT
    return actionResult
  }

  const newUserData: IUser = {
    username,
    username_lower: username.toLowerCase(),
    password: await bcrypt.hash(password, 10)
  }

  const newUser: HydratedDocument<IUser, IUserMethods> = new User(newUserData)
  const userAlreadyExistsInDb: ActionResult<boolean> | ServerError = await doesUserExist(newUserData.username)

  await handleActionModel(userAlreadyExistsInDb, async (result: boolean) => {
    if (!userAlreadyExistsInDb.result) { // If user does not exist in the database
      try {
        await newUser.save()
        actionResult.result = true
        actionResult.msgToServer = 'Successfully created new user: ' + username
      } catch (e) {
        actionResult.serverError = modelErrors.ERROR_SAVING_USER_IN_DB
      }
    } else {
      actionResult.serverError = modelErrors.USER_ALREADY_EXISTS
    }
  })

  return actionResult
}

export const updateGitlabAccessTokenToUser = async (username: string, data: GitlabAccessToken): Promise<boolean> => {
  let res = false

  const user: ActionResult<HydratedDocument<IUser, IUserMethods> | null> = await findOneUserDocument(username)
  // @ts-expect-error err
  await handleActionModel(user, async (result: HydratedDocument<IUser, IUserMethods>) => {
    if (result !== null) {
      try {
        result.gitlab_access_token = data
        await result.save()
        res = true
      } catch (e) {}
    }
  })

  return res
}

export const doesUserHaveGitLabAccessToken = async (username: string): Promise<boolean> => {
  let hasAccess: boolean = false

  const user: ActionResult<HydratedDocument<IUser, IUserMethods> | null> = await findOneUserDocument(username)
  await handleActionModel(user, async (result: HydratedDocument<IUser, IUserMethods> | null) => {
    if (result !== null) {
      if (result.gitlab_access_token !== undefined) hasAccess = true
    }
  })

  return hasAccess
}

export const getUserGitLabAccessToken = async (username: string): Promise<GitlabAccessToken | null> => {
  let token = null

  const user: ActionResult<HydratedDocument<IUser, IUserMethods> | null> = await findOneUserDocument(username)
  await handleActionModel(user, async (result: HydratedDocument<IUser, IUserMethods> | null) => {
    if (result !== null) {
      token = result.gitlab_access_token
    }
  })

  return token
}

export const deleteGitLabAccessToken = async (username: string): Promise<boolean> => {
  let deleted = false
  const user: ActionResult<HydratedDocument<IUser, IUserMethods> | null> = await findOneUserDocument(username)
  await handleActionModel(user, async (result: HydratedDocument<IUser, IUserMethods> | null) => {
    if (result !== null) {
      result.gitlab_access_token = undefined
      await result.save()
      deleted = true
    }
  })

  return deleted
}
