export interface GitLabWebHookCreated {
  id: number
  url: string
}

export interface GitlabAccessToken extends GitLabError {
  access_token?: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
  scope?: string
  created_at?: number
  id_token?: string
}

export interface GitlabAuthorizationToken extends GitLabError {
  code?: string
  state?: string
}

export interface GitLabError {
  error?: string
  error_description?: string
}

export interface GitLabEventPush {
  object_kind: 'push'
  event_name: string
  user_name: string
  user_username: string
  message: string
  user_avatar: string
  project: GitLabProject
  commits: [GitLabCommit]
}

export interface GitLabEventIssue {
  object_kind: 'issue'
  event_name: string
  user: GitLabUser
  project: GitLabProject
  issue: GitLabIssue
}

export interface GitLabEventRelease {
  id: number
  name: string
  description: string
  released_at: string
  tag: string
  url: string
  project: GitLabProject
  commit: GitLabCommit
  action: string
}

export interface GitLabEventNote {
  object_kind: 'note'
  event_name: string
  user: GitLabUser
  project: GitLabProject
}

export interface GitLabObjectInterface {
  description: string
  state: string
  url: string
}

export interface GitLabIssue {
  title: string
  description: string
  url: string
  object_attributes?: GitLabObjectAttributes
}

export interface GitLabTag {
  id: string
  title: string
  message: string
  url: string
}

export interface GitLabRelease {
  title: string
  message: string
  url: string
  timestamp: string
}

export interface GitLabIssue2 {
  id: string
  title: string
  message: string
  url: string
}

export interface GitLabObjectAttributes {
  author_id: number
  action: string
  id: number
  closed_at: string | null
  created_at: string | null
  title: string
  description: string
}

export interface GitLabUser {
  id: number
  name: string
  username: string
  avatar_url: string
}

export interface GitLabProject {
  id: number
  name: string
  description: string
  namespace: string
  path_with_namespace: string
  homepage: string
}

export interface GitLabCommit {
  id: string
  title: string
  message: string
  timestamp: string
  url: string
  author?: [object]
}
