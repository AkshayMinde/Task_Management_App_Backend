const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Task = require('../models/task.model');
const { SECRET_KEY } = process.env.SECRET;
// const {tokenBlacklist} = require('../routes/auth.routes')
const tokenBlacklist = [];

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {

    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
function checkLoggedIn(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ message: err });
    }

    // Retrieve user information from the database
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

      // Include user information in the req.user object
      req.user = user;
      next();
    });
  });
}

// Example validation middleware for registration
const validateRegistration = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('phone number is required')
];


const validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const checkAdmin = (req, res, next) => {
  if (req.user.isAdmin == true) {
    next();
  } else {
    res.json('You are not permitted to do that task');
    // res.redirect('back');
  }
};

const verifyUser = (req, res, next) => {
  if (req.user.isAdmin || req.user.userId.equals(req.params.id)) { /* equals compare a object id with a string */
    next();
  } else {
    req.flash('You are not permitted to do that task');
    res.redirect('back');
  }
};

const isEmailAlreadyRegistered = async (email) => {
  try {
    const existingUser = await User.findOne({ email });
    return existingUser !== null;
  } catch (error) {
    console.error(error);
    return false; // In case of an error, treat it as not registered
  }
};

const verifyToken = (req, res, next) => {
  // const token = req.header('Authorization');
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
    // console.log(error);
  }


  if (tokenBlacklist.includes(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
    console.log(error);
  }

  try {
    jwt.verify(token, process.env.SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
    console.log(error);
  }
};

const canEditTask = (req, res, next) => {
  const { user, params } = req;
  const taskId = params.taskId;

  Task.findById(taskId).exec().then((task, err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.log("Admin",req.user.isAdmin);
    console.log("Task_Id",task.userId);
    console.log("req_id",req.user._id);
    // console.log(req.user.userId);
    if (req.user.isAdmin || (req.user._id.equals(task.userId))) {
      next();
    } else {
      // console.log(err);
      return res.status(403).json({ error: 'Permission denied' });
    }
  });
};

module.exports = {
  validateRegistration,
  validateLogin,
  authMiddleware,
  checkAdmin,
  checkLoggedIn,
  isEmailAlreadyRegistered,
  canEditTask,
  verifyUser,
  verifyToken,
};