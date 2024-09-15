import { Attendance } from '../db/models/attendance.js'

async function listAttendances(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {},
) {
  const attendance = await Attendance.find(query).sort({ [sortBy]: sortOrder })
  return attendance
}

export async function listAllAttendances(options) {
  return await listAttendances({}, options)
}

export async function listAttendancesByUserId(userId, options) {
  return await listAttendances({ userId: userId }, options)
}

export async function getAttendanceById(id) {
  return await Attendance.findById(id)
}

export async function createAttendance({ userId, date, status, reason = '' }) {
  if (date === null || date === undefined) throw new Error('`date` is required')
  date = date instanceof Date ? date : new Date(date)
  const dateOnly = date.toJSON().slice(0, 10)
  const attendance = new Attendance({
    userId,
    date: dateOnly,
    status,
    reason,
  })
  return await attendance.save()
}

export async function updateAttendance(attendanceId, { status, reason = '' }) {
  try {
    const attendance = await Attendance.findById(attendanceId)
    attendance.status = status
    attendance.reason = reason
    const updatedAttendance = attendance.save()
    return updatedAttendance
  } catch (err) {
    console.log('message: ', err.message)
    return err
  }
}

export async function deleteAttendance(attendanceId) {
  return await Attendance.deleteOne({ _id: attendanceId })
}
