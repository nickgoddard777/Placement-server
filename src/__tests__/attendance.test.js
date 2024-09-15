import mongoose from 'mongoose'
import { describe, test, expect, beforeAll } from '@jest/globals'
import {
  createAttendance,
  deleteAttendance,
  listAllAttendances,
  listAttendancesByUserId,
} from '../services/attendances'
import { Attendance } from '../db/models/attendance'
import { createUserCategory } from '../services/userCategories'
import { createUser } from '../services/users'
import moment from 'moment'

let user = null
let testCategory = null
let sampleAttendances = []

beforeAll(async () => {
  testCategory = await createUserCategory({
    name: 'Attendance Test Category',
    admin: false,
    placementAttendee: true,
    staff: false,
  })
  user = await createUser({
    name: 'Register Attendance',
    email: 'register.attendance@email.com',
    password: 'Password',
    category: testCategory._id,
    status: 'active',
  })
  let user2 = await createUser({
    name: 'Register Attendance',
    email: 'register.attendance2@email.com',
    password: 'Password',
    category: testCategory._id,
    status: 'active',
  })
  sampleAttendances = [
    {
      userId: user._id,
      date: new Date(),
      status: 'present',
    },
    {
      userId: user2._id,
      date: new Date(),
      status: 'absent',
      reason: 'sick',
    },
  ]
})

describe('register attendance', () => {
  test('with correct parameters should succeed', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'present',
    }
    const CreateAttendance = await createAttendance(attendance)
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
    await expect(createAttendance(attendance)).rejects.toThrow(
      '`userId` is required',
    )
  })
  test('with date not equal to today should fail', async () => {
    const attendance = {
      userId: user._id,
      date: new Date('2020-01-01'),
      status: 'present',
    }
    await expect(createAttendance(attendance)).rejects.toThrow(
      'Attendance date must be today',
    )
  })
  test('without date should fail', async () => {
    const attendance = {
      userId: user._id,
      status: 'present',
    }
    await expect(createAttendance(attendance)).rejects.toThrow(
      '`date` is required',
    )
  })
  test('without status should fail', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
    }
    await expect(createAttendance(attendance)).rejects.toThrow(
      '`status` is required',
    )
  })
  test('with status equal to absent reason should not be empty', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'absent',
    }
    await expect(createAttendance(attendance)).rejects.toThrow(
      '`reason` is required',
    )
  })
  test('with status equal to plannedAbsence reason should not be empty', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'plannedAbsence',
    }
    await expect(createAttendance(attendance)).rejects.toThrow(
      '`reason` is required',
    )
  })
  test('with status equal to late reason should not be empty', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'late',
    }
    await expect(createAttendance(attendance)).rejects.toThrow(
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
      await createAttendance(attendance)
      await createAttendance(attendance)
    } catch (err) {
      expect(err.message).toContain('E11000 duplicate key error collection:')
    }
  })
  test('with status equal to absent reason can be entered', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'absent',
      reason: 'sick',
    }
    const CreateAttendance = await createAttendance(attendance)
    const foundAttendance = await Attendance.findById(CreateAttendance._id)
    expect(foundAttendance.reason).toEqual(attendance.reason)
  })
  test('with status equal to plannedAbsence date has to be at least one day away', async () => {
    const attendance = {
      userId: user._id,
      date: moment().add(1, 'days').toDate(),
      status: 'plannedAbsence',
      reason: 'vacation',
    }
    const CreateAttendance = await createAttendance(attendance)
    const foundAttendance = await Attendance.findById(CreateAttendance._id)
    expect(foundAttendance.date.toJSON().slice(0, 10)).toEqual(
      attendance.date.toJSON().slice(0, 10),
    )
  })
  test('with status plannedAbsence and date today should fail', async () => {
    const attendance = {
      userId: user._id,
      date: new Date(),
      status: 'plannedAbsence',
      reason: 'vacation',
    }
    await expect(createAttendance(attendance)).rejects.toThrow(
      'Planned absence date must be at least one day in the future.',
    )
  })
})

let createdSampleAttendances = []

beforeEach(async () => {
  await Attendance.deleteMany({})
  createdSampleAttendances = []
  for (const attendance of sampleAttendances) {
    const createdAttendance = new Attendance(attendance)
    createdSampleAttendances.push(await createdAttendance.save())
  }
})

describe('delete attendance', () => {
  test('should remove the attendance from the database', async () => {
    const result = await deleteAttendance(createdSampleAttendances[0]._id)
    expect(result.deletedCount).toEqual(1)
    const deletedAttendance = await Attendance.findById(
      createdSampleAttendances[0]._id,
    )
    expect(deletedAttendance).toEqual(null)
  })
  test('should false if the id does not exist', async () => {
    const result = await deleteAttendance('000000000000000000000000')
    expect(result.deletedCount).toEqual(0)
  })
})

describe('list all attendances', () => {
  test('should return all attendances', async () => {
    const attendances = await listAllAttendances({})
    expect(attendances.length).toEqual(sampleAttendances.length)
  })
  test('for a student should only return their attendances', async () => {
    const attendances = await listAttendancesByUserId({ userId: user._id })
    expect(attendances.length).toEqual(1)
  })
})
