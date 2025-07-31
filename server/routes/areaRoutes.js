import express from 'express'
import { createArea } from '../controllers/areaController.js'

const router = express.Router()
router.post('/', createArea)

export default router