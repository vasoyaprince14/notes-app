const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');

// Schema for registration and login validation
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, "Password must include at least one number, one uppercase letter, one lowercase letter, and one special character"),
  confirmPassword: z.string()
});

exports.register = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Validate input using zod schema
  const result = registerSchema.safeParse({ email, password, confirmPassword });
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors.map(err => err.message) });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ errors: ['Passwords do not match'] });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: ['Email already exists'] });
    }

    // Create new user
    user = new User({
      email,
      password: await bcrypt.hash(password, 10),
    });
    await user.save();

    // Generate JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input using zod schema
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors.map(err => err.message) });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: ['Invalid credentials'] });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: ['Invalid credentials'] });
    }

    // Generate JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ token, id: user.id });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.logout = (req, res) => {
  delete req.headers['x-auth-token'];
  res.json({ msg: 'User logged out' });
};
