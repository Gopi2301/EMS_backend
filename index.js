// import express
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const router = express.Router();
const authRoutes = require('./routes/authRoutes')

dotenv.config();
const mongoURI = process.env.MONGO_URI;
// Middleware to parse x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Middleware to parse json data
app.use(bodyParser.json());
// connect to the MongoDB database
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB..', err));


// define the first route
app.get('/', function (req, res) {
  res.send('<h1>Hello World!</h1>');
});

// deine signup route
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  } else {
    try {
      await User.findOne({ email: email })
        .then(async user => {
          if (user) {
            return res.status(400).json({ message: 'User already exists' });
          }
          const encryptPassword = await bcrypt.hash(password, 10);
          const newUser = new User({ name, email, password: encryptPassword, role });
          // generate token
          const token = jwt.sign({ id: newUser._id }, process.env.SECRET, { expiresIn: '1h' });
          newUser.tokens = newUser.tokens.concat({ token });
          await newUser.save();
          res.status(201).json({ message: 'User created successfully', token: token, user: newUser });
        })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
});

// define login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    // match the email and password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '1h' });

      // cookie section
      const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true
      };
      res.status(200).cookie('token', token, options).json({ message: 'Login successful', token: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// start the server listening for requests
app.listen(process.env.PORT || 3000, 
    () => console.log("Server is running..."));