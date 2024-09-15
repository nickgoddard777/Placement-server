import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { expressjwt as jwt } from 'express-jwt'

import { usersRoutes } from './routes/users.js'
import { userCategoriesRoutes } from './routes/userCategories.js'
import { attendancesRoutes } from './routes/attendances.js'

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(
  '/api/v1',
  jwt({
    secret: () => process.env.JWT_SECRET,
    algorithms: ['HS256'],
  }).unless({ path: ['/api/v1/user/login'] }),
)

usersRoutes(app)
userCategoriesRoutes(app)
attendancesRoutes(app)

app.get('/', (req, res) => {
  res.send('Hello World')
})

export { app }
