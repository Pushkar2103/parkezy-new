import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  const { name, email, password, role } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ name, email, password: hashedPassword, role })

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET)
    res.status(201).json({ user: newUser, token })
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET)
    res.status(200).json({ user, token })
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message })
  }
}
