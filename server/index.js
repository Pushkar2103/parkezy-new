import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import { initScheduledJobs } from './services/cronJobs.js';
import bookingRoutes from './routes/bookingRoutes.js'
import parkingRoutes from './routes/parkingRoutes.js'
import userRoutes from './routes/userRoutes.js'
import profileRoutes from './routes/profileRoutes.js'


dotenv.config()
const app = express()
initScheduledJobs();

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes) 
app.use('/api/parking-areas', parkingRoutes) 
app.use('/api/user', userRoutes)
app.use('/api/profile', profileRoutes)

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
