import ParkingArea from '../models/ParkingArea.js'

export const createArea = async (req, res) => {
  try {
    const { locationId, ownerId, name, totalSlots, isVIPMap, image } = req.body
    const area = await ParkingArea.create({ locationId, ownerId, name, totalSlots, isVIPMap, image })
    res.status(201).json(area)
  } catch (err) {
    res.status(500).json({ error: 'Error creating parking area' })
  }
}