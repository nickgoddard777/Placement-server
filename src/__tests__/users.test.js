import mongoose from 'mongoose'
import { describe, test, expect, beforeEach } from '@jest/globals'
import {
  createUser,
  listAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/users.js'
import { User } from '../db/models/user.js'

describe('creating users', () => {
  test('with all parameters should succeed', async () => {
    const user = {
      name: 'John Doe',
      email: 'testuser1@email.com',
      password: 'Password123!',
    }
    const createdUser = await createUser(user)
    expect(createdUser._id).toBeInstanceOf(mongoose.Types.ObjectId)
    const foundUser = await User.findById(createdUser._id)
    expect(foundUser.name).toEqual(user.name)
    expect(foundUser.email).toEqual(user.email)
    expect(foundUser.password).not.toEqual(user.password)
    expect(foundUser.createdAt).toBeInstanceOf(Date)
    expect(foundUser.updatedAt).toBeInstanceOf(Date)
  })
  test('without name should fail', async () => {
    const user = {
      email: 'DanielBugl@emial.com',
      password: 'Password123!',
    }
    try {
      await createUser(user)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain('`name` is required')
    }
  })
  test('without email should fail', async () => {
    const user = {
      name: 'Daniel Bugl',
      password: 'Password123!',
    }
    try {
      await createUser(user)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain('`email` is required')
    }
  })
  test('with duplicate email should fail', async () => {
    const user1 = {
      name: 'User Name1',
      email: 'test@email.com',
      password: 'Password123!',
    }
    const user2 = {
      name: 'User Name2',
      email: 'test@email.com',
      password: 'Password123!',
    }
    try {
      await createUser(user1)
    } catch (err) {
      console.log(err)
    }

    try {
      await createUser(user2)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain(
        'A user is already registered with this email address.',
      )
    }
  })
})

const sampleUsers = [
  { name: 'John Doe', email: 'john.doe@email.com', password: 'Password' },
  { name: 'Jane Doe', email: 'jane.doe@email.com', password: 'Password' },
  { name: 'Arthur Doe', email: 'arthur.doe@email.com', password: 'Password' },
  { name: 'Brenda Doe', email: 'brenda.doe@email.com', password: 'Password' },
]

let createdSampleUsers = []
beforeEach(async () => {
  await User.deleteMany({})
  createdSampleUsers = []
  for (const user of sampleUsers) {
    const createdUser = new User(user)
    createdSampleUsers.push(await createdUser.save())
  }
})

describe('listing users', () => {
  test('should return all users', async () => {
    const users = await listAllUsers()
    expect(users.length).toEqual(createdSampleUsers.length)
  })
  test('should return users sorted by creation date descending by default', async () => {
    const users = await listAllUsers()
    const sortedSampleUsers = createdSampleUsers.sort(
      (a, b) => b.createdAt - a.createdAt,
    )
    expect(users.map((user) => user.createdAt)).toEqual(
      sortedSampleUsers.map((user) => user.createdAt),
    )
  })
  test('should take into account provided sorting options', async () => {
    const users = await listAllUsers({
      sortBy: 'updatedAt',
      sortOrder: 'ascending',
    })
    const sortedSampleUsers = createdSampleUsers.sort(
      (a, b) => a.updatedAt - b.updatedAt,
    )
    expect(users.map((user) => user.updatedAt)).toEqual(
      sortedSampleUsers.map((user) => user.updatedAt),
    )
  })
})

describe('getting a user', () => {
  test('should return the user', async () => {
    const user = await getUserById(createdSampleUsers[0]._id)
    expect(user.toObject()).toEqual(createdSampleUsers[0].toObject())
  })
  test('should fail if the id does not exist', async () => {
    const user = await getUserById('000000000000000000000000')
    expect(user).toEqual(null)
  })
})

describe('updating users', () => {
  test('should update the specified property', async () => {
    await updateUser(createdSampleUsers[0]._id, {
      name: 'Test User',
    })
    const updatedUser = await User.findById(createdSampleUsers[0]._id)
    expect(updatedUser.name).toEqual('Test User')
  })
  test('should not update other properties', async () => {
    await updateUser(createdSampleUsers[0]._id, {
      name: 'Test Author',
    })
    const updatedUser = await User.findById(createdSampleUsers[0]._id)
    expect(updatedUser.email).toEqual('john.doe@email.com')
  })
  test('should update the updatedAt timestamp', async () => {
    await updateUser(createdSampleUsers[0]._id, {
      name: 'Test User',
    })
    const updatedUser = await User.findById(createdSampleUsers[0]._id)
    expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
      createdSampleUsers[0].updatedAt.getTime(),
    )
  })
  test('should fail if the id does not exist', async () => {
    const user = await updateUser('000000000000000000000000', {
      name: 'Test User',
    })
    expect(user).toEqual(null)
  })
})

describe('deleting users', () => {
  test('should remove the user from the database', async () => {
    const result = await deleteUser(createdSampleUsers[0]._id)
    expect(result.deletedCount).toEqual(1)
    const deletedUser = await User.findById(createdSampleUsers[0]._id)
    expect(deletedUser).toEqual(null)
  })

  test('should fail if the id does not exist', async () => {
    const result = await deleteUser('000000000000000000000000')
    expect(result.deletedCount).toEqual(0)
  })
})
