import { requireAuth } from '../middleware/jwt.js'
import {
  listAllAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../services/attendances.js'

export function attendancesRoutes(app) {
  app.get('/api/v1/attendances', requireAuth, async (req, res) => {
    console.log('query:', req.query)
    const { sortBy, sortOrder } = req.query
    const options = { sortBy, sortOrder }
    try {
      return res.json(await listAllAttendances(options)).status(200)
    } catch (err) {
      console.error('error listing attendances', err)
      return res.status(500).end()
    }
  })
  app.get('/api/v1/attendances/:id', requireAuth, async (req, res) => {
    const id = req.params.id
    try {
      const attendance = await getAttendanceById(id)
      if (attendance === null) {
        return res.status(404).end()
      }
      return res.json(attendance)
    } catch (err) {
      console.error('error getting attendance', err)
      return res.status(500).end()
    }
  })
  app.post('/api/v1/attendances', requireAuth, async (req, res) => {
    if (!req.auth.placementAttendee) return res.sendStatus(401)
    try {
      const attendance = await createAttendance(req.body)
      return res.json(attendance)
    } catch (err) {
      console.error('error creating attendance', err)
      return res.status(500).end()
    }
  })
  app.patch('/api/v1/attendances/:id', requireAuth, async (req, res) => {
    if (!req.auth.admin && !req.auth.placementAttendee)
      return res.sendStatus(401)
    try {
      const attendance = await updateAttendance(req.params.id, req.body)
      return res.json(attendance)
    } catch (err) {
      console.error('error updating attendance', err)
      return res.status(500).end()
    }
  })
  app.delete('/api/v1/attendances/:id', requireAuth, async (req, res) => {
    if (!req.auth.admin && !req.auth.placementAttendee)
      return res.sendStatus(401)
    try {
      const { deletedCount } = await deleteAttendance(req.params.id)
      if (deletedCount === 0) {
        return res.sendStatus(404)
      }
      return res.status(204).end()
    } catch (err) {
      console.error('error deleting attendance', err)
      return res.status(500).end()
    }
  })
}
