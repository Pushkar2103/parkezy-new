import express from 'express'
import { createSlots } from '../controllers/slotController.js'

const router = express.Router()
router.post('/create', createSlots)

export default router
