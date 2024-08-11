import moment from 'moment'
import mongoose, { Schema } from 'mongoose'

async function isToday(date) {
  switch (this.status) {
    case 'plannedAbsence':
      if (moment(date).isBefore(moment().add(1, 'days'), 'day')) {
        throw new Error(
          'Planned absence date must be at least one day in the future.',
        )
      }
      break
    default:
      if (!moment(date).isSame(moment(), 'day')) {
        throw new Error('Attendance date must be today')
      }
  }
}

const attendanceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    date: {
      type: Date,
      required: true,
      validate: isToday,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'plannedAbsence'],
      required: true,
    },
    reason: {
      type: String,
      required: function () {
        return this.status !== 'present'
      },
    },
  },
  { timestamps: true },
)

attendanceSchema.index({ userId: 1, date: -1 }, { unique: true })

export const Attendance = mongoose.model('attendance', attendanceSchema)
