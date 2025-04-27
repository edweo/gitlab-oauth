import { model, type Model, Schema } from 'mongoose'
import { type GitlabAccessToken } from '../../http_req_res_interfaces/gitlab_webhook_api.js'

export interface IUser {
  username: string
  username_lower: string
  password: string
  gitlab_access_token?: GitlabAccessToken
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserMethods {
  // print: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-types
type UserModel = Model<IUser, {}, IUserMethods>

const schema: Schema<IUser, UserModel, IUserMethods> = new Schema<IUser, UserModel, IUserMethods>({
  username: { type: String, required: true, unique: true },
  username_lower: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gitlab_access_token: { type: {} }
})

export const User: UserModel = model<IUser, UserModel>('User', schema)
