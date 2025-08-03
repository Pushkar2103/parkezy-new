import dotenv from 'dotenv'

dotenv.config();

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'
import { initScheduledJobs } from './services/cronJobs.js';
import bookingRoutes from './routes/bookingRoutes.js'
import parkingRoutes from './routes/parkingRoutes.js'
import userRoutes from './routes/userRoutes.js'
import profileRoutes from './routes/profileRoutes.js'


const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/profile', profileRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes) 
app.use('/api/parking-areas', parkingRoutes) 
app.use('/api/user', userRoutes)

app.get('/', (req, res) => {
  res.send('Parkezy Backend Running')
})

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  initScheduledJobs();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
})
