import {
  listAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from '../services/users.js'

export function usersRoutes(app) {
  app.get('/api/v1/users', async (req, res) => {
    const { sortBy, sortOrder } = req.query
    const options = { sortBy, sortOrder }

    try {
      return res.json(await listAllUsers(options))
    } catch (err) {
      console.error('error listing users', err)
      return res.status(500).end()
    }
  })
  app.get('/api/v1/users/:id', async (req, res) => {
    const { id } = req.params
    try {
      const user = await getUserById(id)
      if (user === null) return res.status(404).end()
      return res.json(user)
    } catch (err) {
      console.error('error getting user', err)
      return res.status(500).end()
    }
  })
  app.post('/api/v1/users', async (req, res) => {
    try {
      const user = await createUser(req.body)
      return res.json(user)
    } catch (err) {
      console.error('error creating user', err)
      return res.status(500).end()
    }
  })
  app.patch('/api/v1/users/:id', async (req, res) => {
    try {
      const user = await updateUser(req.params.id, req.body)
      return res.json(user)
    } catch (err) {
      console.error('error updating user', err)
      return res.status(500).end()
    }
  })
  app.delete('/api/v1/users/:id', async (req, res) => {
    try {
      const { deletedCount } = await deleteUser(req.params.id)
      if (deletedCount === 0) return res.sendStatus(404)
      return res.status(204).end()
    } catch (err) {
      console.error('error deleting user', err)
      return res.status(500).end()
    }
  })
  app.post('/api/v1/user/login', async (req, res) => {
    try {
      const token = await loginUser(req.body)
      console.log('token:', token)
      return res.status(200).send({ token })
    } catch (err) {
      return res.status(400).send({
        error: 'login failed, did you enter the correct username/password?',
      })
    }
  })
}
