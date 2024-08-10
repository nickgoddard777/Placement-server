import mongoose from 'mongoose'
import { describe, test, expect, beforeAll } from '@jest/globals'
import { registerAttendance } from '../services/attendance'
import { Attendance } from '../db/models/attendance'
import { createUserCategory } from '../services/userCategories'
import { createUser } from '../services/users'

let user = null
let testCategory = null

beforeAll(async () => {
  testCategory = await createUserCategory({
    name: 'Attendance Test Category',
    admin: true,
    placementAttendee: false,
  })
  user = await createUser({
    name: 'Register Attendance',
    email: 'register.attendance@email.com',
    password: 'Password',
    category: testCategory._id,
    status: 'active',
  })
})

describe('register attendance', () => {
  test('with correct parameters should succeed', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'present',
    }
    const CreateAttendance = await registerAttendance(attendance)
    expect(CreateAttendance._id).toBeInstanceOf(mongoose.Types.ObjectId)
    const foundAttendance = await Attendance.findById(CreateAttendance._id)
    expect(foundAttendance.date).toEqual(
      new Date(attendance.date.toJSON().slice(0, 10)),
    )
    expect(foundAttendance.status).toEqual(attendance.status)
    expect(foundAttendance.reason).toEqual('')
  })
  test('without userid should fail', async () => {
    const attendance = {
      date: new Date(),
      status: 'present',
    }
    await expect(registerAttendance(attendance)).rejects.toThrow(
      '`userId` is required',
    )
  })
  test('with date not equal to today should fail', async () => {
    const attendance = {
      userId: user._id,
      date: new Date('2020-01-01'),
      status: 'present',
    }
    await expect(registerAttendance(attendance)).rejects.toThrow(
      'Attendance date must be today',
    )
  })
  test('without date should fail', async () => {
    const attendance = {
      userId: user._id,
      status: 'present',
    }
    await expect(registerAttendance(attendance)).rejects.toThrow(
      '`date` is required',
    )
  })
  test('without status should fail', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
    }
    await expect(registerAttendance(attendance)).rejects.toThrow(
      '`status` is required',
    )
  })
  test('with status equal to absent reason should not be empty', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'absent',
    }
    await expect(registerAttendance(attendance)).rejects.toThrow(
      '`reason` is required',
    )
  })
  test('with status equal to plannedAbsence reason should not be empty', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'plannedAbsence',
    }
    await expect(registerAttendance(attendance)).rejects.toThrow(
      '`reason` is required',
    )
  })
  test('with status equal to late reason should not be empty', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'late',
    }
    await expect(registerAttendance(attendance)).rejects.toThrow(
      '`reason` is required',
    )
  })
  test('with duplicate userId and Date should fail', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'present',
    }
    try {
      await registerAttendance(attendance)
      await registerAttendance(attendance)
    } catch (err) {
      expect(err.message).toContain('E11000 duplicate key error collection:')
    }
  })
})
