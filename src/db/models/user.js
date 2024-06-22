import mongoose, { Schema } from 'mongoose'

const emailRegExp = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)

async function isEmail(email) {
  if (!emailRegExp.test(email))
    throw new Error('Please enter a valid email address.')
}

async function validateEmail(email) {
  if (!isEmail(email)) throw new Error('Please enter a valid email address.')
  const user = await this.constructor.findOne({ email })
  if (user)
    throw new Error('A user is already registered with this email address.')
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: validateEmail,
    },
    password: { type: String },
  },
  { timestamps: true },
)

export const User = mongoose.model('user', userSchema)
