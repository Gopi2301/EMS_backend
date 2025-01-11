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
const Task = require('./models/task');
const {authToken,checkAdminRole} = require('./middleware/authToken');


// Load environment variables
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
          // hash the password
          const encryptPassword = await bcrypt.hash(password, 10);
          const newUser = new User({ name, email, password: encryptPassword, role });
          // generate token
          const token = jwt.sign({ id: newUser._id, role:role }, process.env.SECRET, { expiresIn: '1h' });
          newUser.tokens = newUser.tokens.concat({ token });
          await newUser.save();
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: newUser._id, name, email, role },
          });
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

app.post('/create/tasks',authToken,checkAdminRole,async (req, res) => {
  const { title, description, status, assignedTo, project, deadline } = req.body;

  // Default status if not provided
  const taskStatus = status || 'Todo';

  // Parse deadline
  const parsedDeadline = new Date(deadline);
  if (isNaN(parsedDeadline)) {
    return res.status(400).json({ message: 'Invalid deadline format. Please use YYYY-MM-DD format.' });
  }

  // Validate required fields
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }
  if (!assignedTo) {
    return res.status(400).json({ message: 'AssignedTo is required' });
  }
  if (!project) {
    return res.status(400).json({ message: 'Project is required' });
  }
  if (!deadline) {
    return res.status(400).json({ message: 'Deadline is required' });
  }

  try {
    // Create and save the task
    const task = new Task({
      title,
      description,
      status: taskStatus,
      assignedTo,
      project,
      deadline: parsedDeadline,
    });

    const savedTask = await task.save();
    res.status(201).json({ message: 'Task created successfully', task: savedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}
);

// start the server listening for requests
app.listen(process.env.PORT || 3000, 
    () => console.log("Server is running..."));