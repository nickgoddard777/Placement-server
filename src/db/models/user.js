import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
  },
  { timestamps: true },
)

export const User = mongoose.model('user', userSchema)
