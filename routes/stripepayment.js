const express = require('express');
const router = express.Router();

const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { makepayment } = require('../controllers/stripepayment');

router.post("/stripepayment", makepayment);

module.exports = router;