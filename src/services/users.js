import { User } from '../db/models/user.js'

export async function createUser({ name, email, password }) {
  const user = new User({ name, email, password })
  return await user.save()
}

async function listUsers(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  return await User.find(query).sort({ [sortBy]: sortOrder })
}

export async function listAllUsers(options) {
  return await listUsers({}, options)
}

export async function getUserById(id) {
  return await User.findById(id)
}

export async function updateUser(userId, { name, email, password }) {
  return await User.findOneAndUpdate(
    { _id: userId },
    { $set: { name, email, password } },
    { new: true },
  )
}

export async function deleteUser(userId) {
  return await User.deleteOne({ _id: userId })
}
