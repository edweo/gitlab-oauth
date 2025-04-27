export interface GitlabApiProject {
  id: number
  description: string
  name: string
  created_at: string
  forks_count: number
  star_count: number
  web_url: string
  last_activity_at: string
  owner: {
    id: number
    username: string
    avatar_url: string
    web_url: string
  }
}
