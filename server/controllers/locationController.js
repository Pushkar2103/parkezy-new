import ParkingLocation from '../models/ParkingLocation.js'

export const createLocation = async (req, res) => {
  try {
    const { name, city, coordinates } = req.body
    const location = await ParkingLocation.create({ name, city, coordinates })
    res.status(201).json(location)
  } catch (err) {
    res.status(500).json({ error: 'Error creating location' })
  }
}