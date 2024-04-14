// routes/eggStorage.js

const express = require("express");
const router = express.Router();
const passportJWT = require("../middleware/passportJWT");
const eggStorageController = require(`../controllers/eggStorageController`);
const validateEggSize = require('../middleware/validateEggSize');

router.post("/", passportJWT.isLogin,validateEggSize, eggStorageController.create);
router.get("/", passportJWT.isLogin, eggStorageController.getAll);
router.get("/:date", passportJWT.isLogin, eggStorageController.getByDate);

module.exports = router;
