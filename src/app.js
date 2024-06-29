import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import { usersRoutes } from './routes/users.js'
import { userCategoriesRoutes } from './routes/userCategories.js'

const app = express()
app.use(cors())
app.use(bodyParser.json())

usersRoutes(app)
userCategoriesRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello World')
})

export { app }
