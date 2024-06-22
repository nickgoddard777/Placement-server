import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/user.js'

export async function createUser({ name, email, password }) {
  var hashedPassword = ''
  if (password !== '' && password !== undefined) {
    hashedPassword = await bcrypt.hash(password, 10)
  }
  const user = new User({ name, email, password: hashedPassword })
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
  var hashedPassword = ''

  if (password !== '' && password !== undefined) {
    hashedPassword = await bcrypt.hash(password, 10)
  }
  return await User.findOneAndUpdate(
    { _id: userId },
    { $set: { name, email, password: hashedPassword } },
    { new: true },
  )
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email })
  if (!user) {
    console.log('invalid email!')
    throw new Error('invalid email!')
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    console.log('invalid password!')
    throw new Error('invalid password!')
  }
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  })
  return token
}

export async function deleteUser(userId) {
  return await User.deleteOne({ _id: userId })
}
