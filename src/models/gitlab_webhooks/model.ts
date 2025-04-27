import { model, type Model, Schema } from 'mongoose'

export interface IGitLabWebHook {
  hook_id: number
  project_id: number
  url: string
  created_at: string
  secret: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
type GitLabWebHookModel = Model<IGitLabWebHook>

const schema: Schema<IGitLabWebHook> = new Schema<IGitLabWebHook>({
  hook_id: { type: Number, required: true, unique: true },
  project_id: { type: Number, required: true, unique: true },
  url: { type: String, required: true },
  created_at: { type: String, required: true },
  secret: { type: String, required: true }
})

export const GitLabWebHook: GitLabWebHookModel = model<IGitLabWebHook, GitLabWebHookModel>('GitLabHook', schema)
