import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultProfilePic = `https://img.icons8.com/?size=100&id=2yC9SZKcXDdX&format=png&color=1A1A1A`; 

    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        role,
        profilePicture: defaultProfilePic 
    });

    const verificationToken = newUser.createVerificationToken();
    await newUser.save();

    const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `Welcome to Parkezy! Please click the following link to verify your email address: ${verifyURL}\nIf you did not create this account, please ignore this email.`;

    await sendEmail({
      email: newUser.email,
      subject: 'Verify Your Email for Parkezy',
      message
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please check your email to verify your account.'
    });

  } catch (err) {
    res.status(500).json({ message: 'Something went wrong during registration', error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).json({ 
            message: 'Email verified successfully!',
            user,
            token 
        });

    } catch (err) {
        res.status(500).json({ message: 'Something went wrong during email verification', error: err.message });
    }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is verified
    if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user; // Declare user outside the try block to make it accessible in catch

  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email address.' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // This URL should point to your React app's password reset page
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Forgot your password? Click the link to reset it: ${resetURL}\nThis link is valid for 10 minutes. If you didn't request this, please ignore this email.`;

    await sendEmail({
      email: user.email,
      subject: 'Your Parkezy Password Reset Token',
      message
    });

    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    // If sending email fails, clear the token from the user document to allow retries
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: 'There was an error sending the email. Please try again later.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    const isSamePassword = await bcrypt.compare(req.body.password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(200).json({ user, token });

  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};
