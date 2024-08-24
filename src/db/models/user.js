import mongoose, { Schema } from 'mongoose'
import { UserCategory } from './userCategory.js'

const emailRegExp = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)

async function isEmail(email) {
  if (!emailRegExp.test(email)) {
    throw new Error('Please enter a valid email address.')
  }
}

async function validateEmail(email) {
  if (!isEmail(email)) {
    throw new Error('Please enter a valid email address.')
  }
  const user = await this.constructor.findOne({
    email,
  })
  if (user) {
    throw new Error('A user is already registered with this email address.')
  }
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
    category: {
      type: Schema.Types.ObjectId,
      ref: 'userCategory',
      required: true,
    },
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'inactive', 'archived'],
      required: true,
    },
  },
  {
    methods: {
      isAdmin: async function () {
        const category = await UserCategory.findById(this.category)
        return category.isAdmin()
      },
      isStaff: async function () {
        const category = await UserCategory.findById(this.category)
        return category.isStaff()
      },
      isPlacementAttendee: async function () {
        const category = await UserCategory.findById(this.category)
        return category.isPlacementAttendee()
      },
    },
  },
  { timestamps: true },
)

export const User = mongoose.model('user', userSchema)
