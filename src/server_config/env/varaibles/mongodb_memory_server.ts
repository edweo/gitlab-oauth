// @ts-expect-error err
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { errorMessage, solutionMessage, successMessage } from '../../console_messages/console_messages.js'

export let mongoMemoryServer: MongoMemoryServer | null = null

export default async function connectDBMock (): Promise<string> {
  try {
    mongoMemoryServer = await MongoMemoryServer.create()
    const timeout: number = 3000
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await mongoose.connect(mongoMemoryServer.getUri(), {
      serverSelectionTimeoutMS: timeout
    })
    console.log()
    successMessage(`Connected to MongoDB Mock using mongo-memory-server: ${mongoMemoryServer.getUri()}`)
    return mongoMemoryServer.getUri()
  } catch (e) {
    errorMessage('ERROR: Failed to connect to MongoDB')
    solutionMessage('Check MONGO_DB_URI in .env and make sure the MongoDB server is running')
    console.log()
    process.exit()
  }
}
