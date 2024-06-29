import {
  createUserCategory,
  listAllUserCategories,
  getUserCategoryById,
  updateUserCategory,
  deleteUserCategory,
} from '../services/userCategories.js'

export function userCategoriesRoutes(app) {
  app.get('/api/v1/userCategories', async (req, res) => {
    try {
      return res.json(await listAllUserCategories())
    } catch (err) {
      console.log('error listing user categories', err)
      return res.status(500).end()
    }
  })
  app.get('/api/v1/userCategories/:id', async (req, res) => {
    const { id } = req.params
    try {
      const userCategory = await getUserCategoryById(id)
      if (userCategory === null) {
        return res.status(404).end()
      }
      return res.json(userCategory)
    } catch (err) {
      console.error('error getting userCategory', err)
      return res.status(500).end()
    }
  })
  app.post('/api/v1/userCategories', async (req, res) => {
    try {
      const userCategory = await createUserCategory(req.body)
      return res.json(userCategory)
    } catch (err) {
      console.error('error creating userCategory', err)
      return res.status(500).end()
    }
  })
  app.patch('/api/v1/userCategories/:id', async (req, res) => {
    try {
      const userCategory = await updateUserCategory(req.params.id, req.body)
      return res.json(userCategory)
    } catch (err) {
      console.error('error updating userCategory', err)
      return res.status(500).end()
    }
  })
  app.delete('api/v1/userCategories/:id', async (req, res) => {
    try {
      const { deletedCount } = await deleteUserCategory(req.params.id)
      if (deletedCount === 0) {
        return res.sendStatus(404)
      }
      return res.status(204).end()
    } catch (err) {
      console.error('error deleting user category', err)
      return res.status(500).end()
    }
  })
}
