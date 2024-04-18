// sellEgg.js
const express = require("express");
const router = express.Router();
const passportJWT = require("../middleware/passportJWT");
const sellEggController = require("../controllers/sellEggController");

router.post("/", passportJWT.isLogin, sellEggController.sellEgg);

module.exports = router;
