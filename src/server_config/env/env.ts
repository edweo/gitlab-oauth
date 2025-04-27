import initPort from './varaibles/port.js'
import connectDB from './varaibles/mongodb_connection.ts'
// import connectDBMock from './varaibles/mongodb_memory_server.js'

export interface EnvSettings {
  port: number
  mongoUri: string
}

export async function initEnv (): Promise<EnvSettings> {
  const port: number = initPort() // Check that port is added in .env file

  if (process.env.GITLAB_APP_ID === undefined) {
    console.log('ERROR: Missing \'GITLAB_APP_ID\' declaration in the .env file.')
    process.exit()
  }

  if (process.env.GITLAB_APP_SECRET === undefined) {
    console.log('ERROR: Missing \'GITLAB_APP_SECRET\' declaration in the .env file.')
    process.exit()
  }

  let mongoUri: string = ''
  if (process.env.NODE_ENV === 'test') {
    // mongoUri = await connectDBMock() // Connect to MongoDB via Mock for testing using mongo-memory-server
  } else {
    mongoUri = await connectDB() // Connect to real dev/production MongoDB via mongoose using MONGO_DB_URI
  }

  return {
    port,
    mongoUri
  }
}
