let express = require('express');
let router = express.Router();
let upload = require('../config/multer.config.js');
 
const awsWorker = require('../controllers/aws.controller.js');
 
router.post('/', upload.single("file"), awsWorker.doUpload);
 
module.exports = router;