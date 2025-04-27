import mongoose from 'mongoose'
import { actionMessage, errorMessage, solutionMessage, successMessage } from '../../console_messages/console_messages.js'

mongoose.Promise = global.Promise

export default async function connectDB (): Promise<string> {
  const mongoURI: string | undefined = process.env.MONGO_DB_URI

  if (mongoURI === undefined) {
    console.log('ERROR: Missing MONGO_DB_URI declaration in the .env file.')
    process.exit()
  }

  try {
    const timeout: number = 3000
    console.log()
    actionMessage(`Trying to connect to MongoDB (timeout ${timeout}ms)...`)
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: timeout
    })
    // Print information about connection
    if (!(process.env.NODE_ENV === 'test')) {
      const address: string = mongoURI.split('@')[1].split('?')[0]
      successMessage(`Connected to MongoDB in Docker on address: ${address}`)
      console.log()
    }
    return mongoURI
  } catch (e) {
    errorMessage('ERROR: Failed to connect to MongoDB')
    solutionMessage('Check MONGO_DB_URI in .env and make sure the MongoDB server is running')
    console.log()
    process.exit()
  }
}
