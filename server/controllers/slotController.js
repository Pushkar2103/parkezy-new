import ParkingSlot from '../models/ParkingSlot.js'

export const createSlots = async (req, res) => {
  try {
    const { areaId, totalSlots } = req.body

    const slots = []
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        areaId,
        slotNumber: `S${i}`
      })
    }

    await ParkingSlot.insertMany(slots)
    res.status(201).json({ message: 'Slots created successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Error creating slots' })
  }
}