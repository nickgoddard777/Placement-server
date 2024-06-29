import mongoose from 'mongoose'

async function validateName(name) {
  const userCategory = await this.constructor.findOne({ name })
  if (userCategory) {
    throw new Error('A user category is already registered with this name.')
  }
}

const userCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      validate: validateName,
    },
    admin: { type: Boolean, required: true },
    placementAttendee: { type: Boolean, required: true },
  },
  { timestamps: true },
)

export const UserCategory = mongoose.model('userCategory', userCategorySchema)
