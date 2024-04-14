const express = require("express");
const router = express.Router();
const passportJWT = require("../middleware/passportJWT");
const houseController = require(`../controllers/houseController`)

router.get("/", passportJWT.isLogin, houseController.getAllHouses);
router.get("/:id", passportJWT.isLogin, houseController.getHouseById);
router.post("/", passportJWT.isLogin, houseController.createHouse);
router.put("/:id", passportJWT.isLogin, houseController.updateHouse);
router.delete("/:id", passportJWT.isLogin, houseController.deleteHouse);

module.exports = router;
