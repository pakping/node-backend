const express = require("express");
const router = express.Router();
const userController = require(`../controllers/userController.js`);
const { body } = require("express-validator");
const passportJWT = require("../middleware/passportJWT.js");
const checkRole = require("../middleware/checkRole.js");
router.get("/allusers", [passportJWT.isLogin], userController.index);
router.post("/login", userController.login);
router.post(
  "/register",
  [
    body("name").not().isEmpty().withMessage("กรุณาป้อนข้อมูลชื่อสกุลด้วย"),
    body("email")
      .not()
      .isEmpty()
      .withMessage("กรุณากรอกอีเมล์ด้วย")
      .isEmail()
      .withMessage("รูปแบบอีเมล์ไม่ถูกต้อง"),
    body("password")
      .not()
      .isEmpty()
      .withMessage("กรุณากรอกรหัสผ่านด้วย")
      .isLength({
        min: 3,
      })
      .withMessage("รหัสผ่านต้อง 3 ตัวอักษรขึ้นไป"),
  ],
  userController.register
);

router.get("/me", [passportJWT.isLogin], userController.me);
router.put(
  "/change-password",
  [passportJWT.isLogin],
  userController.changePassword
);
router.post(
  "/reset-password",
  [passportJWT.isLogin, checkRole.isAdmin],
  userController.resetPassword
);
router.delete(
  "/del/:userId",
  [passportJWT.isLogin, checkRole.isAdmin],
  userController.deleteDataUser
); // เพิ่ม middleware isAdmin ที่นี่
module.exports = router;
