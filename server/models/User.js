import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner'], default: 'user' },
  
  // Fields for email verification
  isVerified: { type: Boolean, default: false },
  verificationToken: String,

  // Fields for password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

// Method to generate a password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  
  return resetToken; // Return the unhashed token to be sent via email
};

userSchema.methods.createVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    return verificationToken; 
};


export default mongoose.model('User', userSchema);
