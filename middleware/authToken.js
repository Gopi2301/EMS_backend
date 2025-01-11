const jwt = require('jsonwebtoken');
const User = require('../models/users');
const bodyParser = require('body-parser');

const authToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied, No token Provided' });
    }
    try{
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user ={
            id: decoded.id,
            role: decoded.role
        }
        next();
    }catch(err){
        return res.status(401).json({ message: 'Invalid token' });
    }
};
const checkAdminRole = async (req, res, next) => {  
    if(req.user.role === 'admin'){
        next();
    } else {
      res.status(401).json({ message: 'Access denied, Admin only' });
    }
}


module.exports = { authToken, checkAdminRole};