const express = require('express')
const router = express.Router()
const multer = require('multer')
const register = require('../Controllers/user/register.js');
const login = require('../Controllers/user/login.js');
const googleAuth = require('../Controllers/user/googleAuth.js');
const userlist = require('../Controllers/user/userlist.js');
const usersingle = require('../Controllers/user/usersingle.js');
const updateuser = require('../Controllers/user/updateuser.js');
const deleteuser = require('../Controllers/user/deleteuser.js');
const authenticateToken = require('../middlewares/verifytoken.js');
const frontenduser = require('../Controllers/user/frontend/frontend_usersingle.js');
const frontendupdateuser = require('../Controllers/user/frontend/frontend_updateuser.js');
const { forgetpassword, resetpassword } = require('../Controllers/user/forgetpassword.js');

const upload = multer();
router.get('/', userlist)
router.get('/userinfo', authenticateToken, frontenduser)
router.get('/:id', usersingle)
router.delete('/:id', deleteuser)
router.post('/register', register)
router.post('/login', upload.none(), login)
router.post('/google', upload.none(), googleAuth)
router.post('/forgetpassword', upload.none(), forgetpassword)
router.patch('/forgetpassword/:userId/:token', upload.none(), resetpassword)
router.patch('/', authenticateToken, frontendupdateuser)
router.patch('/:id', authenticateToken, updateuser)


module.exports = router