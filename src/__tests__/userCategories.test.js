import mongoose from 'mongoose'
import { describe, test, expect, beforeEach } from '@jest/globals'
import {
  createUserCategory,
  listAllUserCategories,
  getUserCategoryById,
  updateUserCategory,
  deleteUserCategory,
} from '../services/userCategories'
import { UserCategory } from '../db/models/userCategory'
import { deleteUser } from '../services/users'

describe('create user category', () => {
  test('with correct parameters should succeed', async () => {
    const category = {
      name: 'Test Category',
      admin: true,
      placementAttendee: false,
    }
    const CreateUserCategory = await createUserCategory(category)
    expect(CreateUserCategory._id).toBeInstanceOf(mongoose.Types.ObjectId)
    const foundUserCategory = await UserCategory.findById(
      CreateUserCategory._id,
    )
    expect(foundUserCategory.name).toEqual(category.name)
    expect(foundUserCategory.admin).toEqual(category.admin)
    expect(foundUserCategory.placementAttendee).toEqual(
      category.placementAttendee,
    )
  })
  test('without name should fail', async () => {
    const category = {
      admin: true,
      placementAttendee: false,
    }
    try {
      const CreateUserCategory = await createUserCategory(category)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain('`name` is required')
    }
  })
  test('with duplicate name should fail', async () => {
    const userCategory1 = {
      name: 'Duplicate Category',
      admin: true,
      placementAttendee: false,
    }
    const userCategory2 = {
      name: 'Duplicate Category',
      admin: true,
      placementAttendee: false,
    }
    debugger
    await createUserCategory(userCategory1)

    try {
      await createUserCategory(userCategory2)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain(
        'A user category is already registered with this name.',
      )
    }
  })
})

const sampleUserCategories = [
  { name: 'Test Category 1', admin: true, placementAttendee: false },
  { name: 'Test Category 2', admin: false, placementAttendee: true },
  { name: 'Test Category 3', admin: false, placementAttendee: false },
  { name: 'Test Category 4', admin: false, placementAttendee: false },
]

let createdSampleUserCategories = []
beforeEach(async () => {
  await UserCategory.deleteMany({})
  createdSampleUserCategories = []
  for (const userCategory of sampleUserCategories) {
    const createdUserCategory = new UserCategory(userCategory)
    createdSampleUserCategories.push(await createdUserCategory.save())
  }
})

describe('listing user categories', () => {
  test('should return all user categories', async () => {
    const categories = await listAllUserCategories()
    expect(categories.length).toEqual(createdSampleUserCategories.length)
  })
})

describe('getting a user category', () => {
  test('should return the user category', async () => {
    const userCategory = await getUserCategoryById(
      createdSampleUserCategories[0]._id,
    )
    expect(userCategory.toObject()).toEqual(
      createdSampleUserCategories[0].toObject(),
    )
  })
  test('should fail if the id does not exist', async () => {
    const userCategory = await getUserCategoryById('000000000000000000000000')
    expect(userCategory).toBeNull()
  })
})

describe('updating a user category', () => {
  test('should update the specified property', async () => {
    await updateUserCategory(createdSampleUserCategories[0]._id, {
      name: 'Test User Category',
    })
    const updatedUserCategory = await UserCategory.findById(
      createdSampleUserCategories[0]._id,
    )
    expect(updatedUserCategory.name).toEqual('Test User Category')
  })
  test('should not update other properties', async () => {
    await updateUserCategory(createdSampleUserCategories[0]._id, {
      name: 'Test User Category',
    })
    const updatedUserCategory = await UserCategory.findById(
      createdSampleUserCategories[0]._id,
    )
    expect(updatedUserCategory.admin).toEqual(true)
  })
  test('should update the updatedAt timestamp', async () => {
    await updateUserCategory(createdSampleUserCategories[0]._id, {
      name: 'Test User Category',
    })
    const updatedUserCategory = await UserCategory.findById(
      createdSampleUserCategories[0]._id,
    )
    expect(updatedUserCategory.updatedAt.getTime()).toBeGreaterThan(
      createdSampleUserCategories[0].updatedAt.getTime(),
    )
  })
  test('should fail if the id does not exist', async () => {
    const userCategory = await updateUserCategory('000000000000000000000000', {
      name: 'Test User Category',
    })
    expect(userCategory).toEqual(null)
  })
})

describe('deleting a user category', () => {
  test('should remove the user category from the database', async () => {
    const result = await deleteUserCategory(createdSampleUserCategories[0]._id)
    expect(result.deletedCount).toEqual(1)
    const deletedUserCategory = await UserCategory.findById(
      createdSampleUserCategories[0]._id,
    )
    expect(deletedUserCategory).toEqual(null)
  })
})
