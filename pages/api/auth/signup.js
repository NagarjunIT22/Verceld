import User from '../../../models/User';
import db from '../../../utils/db';
import bcryptjs from 'bcryptjs';

async function handler(req, res) {
  // We only want to allow POST requests to this endpoint
  if (req.method !== 'POST') {
    return;
  }

  const { name, email, password } = req.body;

  // Basic validation
  if (
    !name ||
    !email ||
    !email.includes('@') ||
    !password ||
    password.trim().length < 5
  ) {
    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }

  // Connect to the database
  await db.connect();

  // Check if the user already exists
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    res.status(422).json({ message: 'User exists already!' });
    await db.disconnect();
    return;
  }

  // Create a new user
  const newUser = new User({
    name,
    email,
    // Hash the password before saving
    password: bcryptjs.hashSync(password),
    isAdmin: false,
  });

  // Save the new user to the database
  const user = await newUser.save();
  await db.disconnect();

  // Send a success response
  res.status(201).send({
    message: 'Created user!',
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
}

export default handler;
