import { Attendance } from '../db/models/attendance.js'

export async function registerAttendance({
  userId,
  date,
  status,
  reason = '',
}) {
  const dateOnly = date !== undefined ? date.toJSON().slice(0, 10) : date
  const attendance = new Attendance({
    userId,
    date: dateOnly,
    status,
    reason,
  })
  return await attendance.save()
}
