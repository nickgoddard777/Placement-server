import mongoose from 'mongoose'

export async function initDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL

  await mongoose.connection.on('open', () => {
    console.info('successfully connected to the database:', DATABASE_URL)
  })
  const connection = await mongoose.connect(DATABASE_URL)

  return connection
}
