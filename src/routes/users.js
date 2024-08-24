import {
  listAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from '../services/users.js'
import { requireAuth } from '../middleware/jwt.js'

export function usersRoutes(app) {
  app.get('/api/v1/users', requireAuth, async (req, res) => {
    if (!req.auth.admin && !req.auth.staff) return res.sendStatus(401)
    console.log('query:', req.query)
    const { sortBy, sortOrder } = req.query
    const options = { sortBy, sortOrder }
    try {
      return res.json(await listAllUsers(options)).status(200)
    } catch (err) {
      console.error('error listing users', err)
      return res.status(500).end()
    }
  })
  app.get('/api/v1/users/:id', requireAuth, async (req, res) => {
    const id = req.params.id
    if (!req.auth.admin && !req.auth.staff && req.auth.sub !== id)
      return res.sendStatus(401)
    try {
      const user = await getUserById(id)
      if (user === null) {
        return res.status(404).end()
      }
      return res.json(user)
    } catch (err) {
      console.error('error getting user', err)
      return res.status(500).end()
    }
  })
  app.post('/api/v1/users', requireAuth, async (req, res) => {
    if (!req.auth.admin) return res.sendStatus(401)
    try {
      const user = await createUser(req.body)
      return res.json(user)
    } catch (err) {
      console.error('error creating user', err)
      return res.status(500).end()
    }
  })
  app.patch('/api/v1/users/:id', requireAuth, async (req, res) => {
    try {
      const user = await updateUser(req.params.id, req.body)
      return res.json(user)
    } catch (err) {
      console.error('error updating user', err)
      return res.status(500).end()
    }
  })
  app.delete('/api/v1/users/:id', async (req, res) => {
    // if (!req.auth.admin) return res.sendStatus(401)
    try {
      const { deletedCount } = await deleteUser(req.params.id)
      if (deletedCount === 0) {
        return res.sendStatus(404)
      }
      return res.status(204).end()
    } catch (err) {
      console.error('error deleting user', err)
      return res.status(500).end()
    }
  })
  app.post('/api/v1/user/login', async (req, res) => {
    try {
      const { token, user } = await loginUser(req.body)
      return res.status(200).send({ token, user })
    } catch (err) {
      console.error('error logging in', err)
      return res.status(400).send({
        error: 'login failed, ' + err.message,
      })
    }
  })
}
