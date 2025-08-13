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
import paymentRoutes from './routes/paymentRoutes.js';


const app = express()

const allowedOrigins = [
    'http://localhost:5173', // For local development
    process.env.FRONTEND_URL // For your deployed frontend
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Request from origin ${origin} blocked.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true,
};

app.use(express.json())
app.use(cors(corsOptions))

app.use('/api/profile', profileRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes) 
app.use('/api/parking-areas', parkingRoutes) 
app.use('/api/user', userRoutes)
app.use('/api/payments', paymentRoutes)

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
