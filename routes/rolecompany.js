// routes/rolecompany.js
const express = require("express");
const router = express.Router();
const passportJWT = require("../middleware/passportJWT");
const checkRole = require("../middleware/checkRole");
const roleController = require(`../controllers/roleController`); // ต้องแก้เป็น roleController หรือชื่อที่ถูกต้อง

router.get(
  "/",
  [passportJWT.isLogin, checkRole.isAdmin],
  roleController.index
);

module.exports = router;
