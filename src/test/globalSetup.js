import { MongoMemoryServer } from 'mongodb-memory-server'

export default async function globalSetup() {
  const instance = await MongoMemoryServer.create({
    binary: {
      version: '7.0.11',
    },
  })
  global.__MONGOINSTANCE = instance
  process.env.DATABASE_URL = await instance.getUri()
}
