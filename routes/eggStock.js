const express = require("express");
const router = express.Router();
const passportJWT = require("../middleware/passportJWT");
const eggStockController = require("../controllers/eggStockController");

// เส้นทางอื่นๆที่มีอยู่
router.post("/", passportJWT.isLogin, eggStockController.addEggToStock);
router.delete("/", passportJWT.isLogin, eggStockController.removeEggFromStock);
router.get("/", passportJWT.isLogin, eggStockController.getAllEggStock);

module.exports = router;
