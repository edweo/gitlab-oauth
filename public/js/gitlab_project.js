const commitsHTML = document.querySelector('.commits').querySelector('.content')
const issuesHTML = document.querySelector('.issues').querySelector('.content')
const releasesHTML = document.querySelector('.releases').querySelector('.content')
const tagsHTML = document.querySelector('.tags').querySelector('.content')
const connectionStatus = document.querySelector('.ws-status')

const webSocketURL = document.querySelector('.ws-url').value

const socket = new WebSocket(webSocketURL)

issuesHTML.addEventListener('close-issue', e => {
  e.stopPropagation()
  console.log('GOT EVENT')
  console.log(e)
  console.log(e.id)
})

socket.addEventListener('open', () => {
  connectionStatus.querySelector('.text').textContent = 'Connected'
  connectionStatus.style.backgroundColor = 'green'
  connectionStatus.style.color = 'white'
})

socket.addEventListener('message', (msg) => {
  try {
    const data = JSON.parse(msg.data)
    console.log(data)
    console.log(data.msg)
    switch (data.type) {
      case 'issue':
        issuesHTML.prepend(createGitLabIssue(data.title, data.description, data.url, data.id))
        break
      case 'commit':
        commitsHTML.prepend(createGitLabCommit(data.author, data.title, data.msg, data.timestamp, data.url))
        break
      case 'release':
        releasesHTML.prepend(createGitLabRelease(data.title, data.description, data.timestamp, data.url))
        break
      case 'tag':
        tagsHTML.prepend(createGitLabTag(data.title, data.message, data.url))
        break
    }
  } catch (e) {
    console.log(msg.data)
  }
})

socket.addEventListener('close', () => {
  connectionStatus.querySelector('.text').textContent = 'Disconnected'
  connectionStatus.style.backgroundColor = 'red'
  connectionStatus.style.color = 'white'
})

function tag (text, bgColor, txtColor, tagClass) {
  const tag = document.createElement('h2')
  tag.className = `${tagClass} p-0.5 rounded h-full font-bold`
  tag.style.backgroundColor = bgColor
  tag.style.color = txtColor
  tag.textContent = text

  return tag
}

function createGitLabCommit (author, title, msg, timestamp, url) {
  const commit = document.createElement('div')
  commit.className = 'bg-black/20 p-2 flex flex-col rounded w-full'

  const topBar = document.createElement('div')
  topBar.className = 'flex flex-row items-center justify-between'

  const tagsAndButtons = document.createElement('div')
  tagsAndButtons.className = 'flex items-center justify-end gap-1'

  const tags = document.createElement('div')
  tags.className = 'flex'
  tags.className = 'links-tags flex items-center justify-end gap-1'

  const buttons = document.createElement('div')
  buttons.className = 'flex items-center justify-end gap-1'

  const bottomBar = document.createElement('div')
  bottomBar.className = 'flex flex-row items-center justify-start gap-1'

  const titleCommit = document.createElement('h1')
  titleCommit.className = 'text-white font-3xl font-bold'
  titleCommit.textContent = title

  const message = document.createElement('h2')
  message.textContent = msg

  const username = document.createElement('h2')
  username.className = 'bg-black/10 px-2 rounded text-black font-bold'
  username.textContent = author

  const time = document.createElement('h2')
  time.textContent = timestamp

  const urlLink = document.createElement('a')
  urlLink.className = 'bg-black/50 p-0.5 rounded hover:bg-black/40'
  urlLink.target = '_blank'
  urlLink.href = url
  urlLink.textContent = '🔗'

  buttons.append(urlLink)
  tags.append(tag('NEW', 'green', 'white'))

  tagsAndButtons.append(tags, buttons)
  topBar.append(titleCommit, tagsAndButtons)
  bottomBar.append(username, time)
  commit.append(topBar, message, bottomBar)

  return commit
}

function createGitLabIssue (title, description, url, id) {
  const issue = document.createElement('div')
  issue.className = 'bg-black/20 p-2 flex flex-col rounded w-full'

  const topBar = document.createElement('div')
  topBar.className = 'flex flex-row items-center justify-between'

  const tagsAndButtons = document.createElement('div')
  tagsAndButtons.className = 'flex items-center justify-end gap-1'

  const tags = document.createElement('div')
  tags.className = 'flex'
  tags.className = 'links-tags flex items-center justify-end gap-1'

  const buttons = document.createElement('div')
  buttons.className = 'flex items-center justify-end gap-1'

  const bottomBar = document.createElement('div')
  bottomBar.className = 'flex flex-row items-center justify-start gap-1'

  const titleCommit = document.createElement('h1')
  titleCommit.className = 'text-white font-3xl font-bold'
  titleCommit.textContent = title

  const message = document.createElement('h2')
  message.textContent = description

  const urlLink = document.createElement('a')
  urlLink.className = 'bg-black/50 p-0.5 rounded hover:bg-black/40'
  urlLink.target = '_blank'
  urlLink.href = url
  urlLink.textContent = '🔗'

  const closeIssue = document.createElement('button')
  closeIssue.className = 'bg-black/50 p-0.5 rounded hover:bg-black/40'
  closeIssue.textContent = '🗑️'
  closeIssue.addEventListener('click', e => {
    e.stopPropagation()
    const issueEvent = new Event('close-issue', { id })
    closeIssue.dispatchEvent(issueEvent)
  })

  buttons.append(urlLink, closeIssue)
  tags.append(tag('NEW', 'green', 'white'))

  tagsAndButtons.append(tags, buttons)
  topBar.append(titleCommit, tagsAndButtons)
  bottomBar.append()
  issue.append(topBar, message, bottomBar)

  return issue
}

function createGitLabRelease (title, description, timestamp, url) {
  const release = document.createElement('a')
  release.className = 'bg-black/20 p-2 flex flex-col rounded w-full'
  release.target = '_blank'
  release.href = url

  const titleTag = document.createElement('h1')
  titleTag.className = 'text-white font-3xl font-bold'
  titleTag.textContent = title

  const desc = document.createElement('h2')
  desc.textContent = description

  const releasedAt = document.createElement('h2')
  releasedAt.className = 'text-green-400'
  releasedAt.textContent = timestamp

  release.append(titleTag, desc, releasedAt)

  return release
}

function createGitLabTag (title, message, url) {
  const tag = document.createElement('a')
  tag.className = 'bg-black/20 p-2 flex flex-col rounded w-full'
  tag.target = '_blank'
  tag.href = url

  const titleTag = document.createElement('h1')
  titleTag.className = 'text-white font-3xl font-bold'
  titleTag.textContent = title

  const desc = document.createElement('h2')
  desc.textContent = message

  tag.append(titleTag, desc)

  return tag
}
