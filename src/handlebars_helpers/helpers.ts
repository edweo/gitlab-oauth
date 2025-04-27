import config from '../../server_config.js'

export const baseUrl = (text: string): string => {
  return config.base_url + text
}

export const descriptionFormat = (text: string | null): string => {
  let result = ''
  let stringEmpty = true
  try {
    stringEmpty = text?.length === 0
  } catch (e) {}
  if (text === null || stringEmpty) {
    result = 'No description'
  } else {
    result = text
  }
  return result
}
