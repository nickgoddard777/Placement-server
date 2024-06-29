import { UserCategory } from '../db/models/userCategory.js'

export async function createUserCategory({ name, admin, placementAttendee }) {
  const userCategory = new UserCategory({ name, admin, placementAttendee })
  return await userCategory.save()
}

export async function listAllUserCategories() {
  return await UserCategory.find()
}

export async function getUserCategoryById(id) {
  return await UserCategory.findById(id)
}

export async function updateUserCategory(
  userCategoryId,
  { name, admin, placementAttendee },
) {
  return await UserCategory.findOneAndUpdate(
    { _id: userCategoryId },
    { $set: { name, admin, placementAttendee } },
    { new: true },
  )
}

export async function deleteUserCategory(userCategoryId) {
  return await UserCategory.deleteOne({ _id: userCategoryId })
}
