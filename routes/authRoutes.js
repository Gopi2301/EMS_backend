const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/users');
const bodyParser = require('body-parser');

