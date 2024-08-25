import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/user.js'
import { UserCategory } from '../db/models/userCategory.js'

export async function createUser({ name, email, password, category }) {
  var hashedPassword = ''
  if (password !== '' && password !== undefined) {
    hashedPassword = await bcrypt.hash(password, 10)
  }
  const user = new User({
    name,
    email,
    password: hashedPassword,
    category,
  })
  return await user.save()
}

async function listUsers(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  const user = await User.find(query).sort({ [sortBy]: sortOrder })
  return user
}

export async function listAllUsers(options) {
  return await listUsers({}, options)
}

export async function listUsersByCategory(categoryName, options) {
  const userCategory = await UserCategory.findOne({ name: categoryName })
  if (!userCategory) return []
  const users = await listUsers({ category: userCategory._id }, options)
  return users
}

export async function getUserById(id) {
  return await User.findById(id)
}

export async function updateUser(userId, { name, email, password, category }) {
  var hashedPassword = ''

  if (password !== '' && password !== undefined) {
    hashedPassword = await bcrypt.hash(password, 10)
  }
  const user = await User.findById(userId)
  if (!user) {
    console.log('User not found', userId)
    throw new Error('User not found')
  }
  if (name !== undefined) user.name = name
  if (email !== undefined) user.email = email
  if (password !== undefined) user.password = hashedPassword
  if (category !== undefined) user.category = category
  const saveduser = await user.save()
  return saveduser
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
  console.log('user:', user)
  const isAdmin = await user.isAdmin()
  const isPlacementAttendee = await user.isPlacementAttendee()
  const isStaff = await user.isStaff()
  const token = jwt.sign(
    {
      sub: user._id,
      admin: isAdmin,
      placementAttendee: isPlacementAttendee,
      staff: isStaff,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    },
  )
  return { token, user }
}

export async function deleteUser(userId) {
  return await User.deleteOne({ _id: userId })
}
