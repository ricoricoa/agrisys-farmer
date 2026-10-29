const express = require('express');
const controller = require('./controllers/farmerController');

const router = express.Router();

router.get('/', controller.getStatus);

module.exports = router;
