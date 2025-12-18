const express = require('express')
const contactus = require('../Controllers/info/contactus')
const router = express.Router()
const upload = require('../middlewares/image-uploader.js');
const webinfo = require('../Controllers/info/webinfo.js');
const getwebinfo = require('../Controllers/info/getwebinfo.js');
const editwebinfo = require('../Controllers/info/editwebinfo.js');
const contactlist = require('../Controllers/info/contactlist.js');
const countinfo = require('../Controllers/info/countinfo.js');
const contactlistlatest = require('../Controllers/info/contactlistlatest.js');
const deletecontact = require('../Controllers/info/deletecontact.js');


router.get('/contactus', contactlist)
router.get('/contactus10', contactlistlatest)
router.post('/contactus', upload.none(), contactus);
router.delete('/contactus', deletecontact);
router.delete('/contactus/:id', deletecontact);
router.post('/websiteinfo', upload.fields([
  { name: 'logo', maxCount: 1 },
]), webinfo);
router.patch('/websiteinfo', upload.fields([
  { name: 'logo', maxCount: 1 },
]), editwebinfo);
router.get('/websiteinfo', getwebinfo);
router.get('/countinfo', countinfo);

module.exports = router