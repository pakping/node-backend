// sellEgg.js
const express = require("express");
const router = express.Router();
const passportJWT = require("../middleware/passportJWT");
const sellEggController = require("../controllers/sellEggController");

router.post("/", passportJWT.isLogin, sellEggController.sellEgg);
router.get("/getSoldEggs",passportJWT.isLogin, sellEggController.getSoldEggs);
router.get("/getSalesSummary",passportJWT.isLogin, sellEggController.getSalesSummary);
// router.post("/saveSalesSummaryToDatabase",passportJWT.isLogin, sellEggController.saveSalesSummaryToDatabase);

module.exports = router;
