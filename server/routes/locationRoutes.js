import express from 'express'
import { createLocation } from '../controllers/locationController.js'

const router = express.Router()
router.post('/', createLocation)

export default router