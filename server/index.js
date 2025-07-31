import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import areaRoutes from './routes/areaRoutes.js'
import slotRoutes from './routes/slotRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/locations', locationRoutes)
app.use('/api/areas', areaRoutes)
app.use('/api/slots', slotRoutes)
app.use('/api/bookings', bookingRoutes)

app.get('/', (req, res) => {
  res.send('Parkezy Backend Running')
})

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}).catch(err => {
  console.error('MongoDB connection error:', err)
})
