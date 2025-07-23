const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/citoyen.controller');

router.get('/citoyens/:nci', ctrl.getCitoyenByNci);

module.exports = router;
