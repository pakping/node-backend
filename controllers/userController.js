// controllers/userController.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");
const axios = require("axios");
exports.index = async (req, res, next) => {
  try {
    const users = await UserModel.getAllUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      const error = new Error("ไม่พบผู้ใช้งานในระบบ");
      error.statusCode = 404;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error("รหัสผ่านไม่ถูกต้อง");
      error.statusCode = 401;
      throw error;
    }

    const token = await jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5 days" }
    );

    const expires_in = jwt.decode(token);

    return res.status(200).json({
      access_token: token,
      expires_in: expires_in.exp,
      token_type: "Bearer",
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      const error = new Error("อีเมล์ซ้ำ มีผู้ใช้งานแล้ว ลองใหม่อีกครั้ง");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "member";
    await UserModel.createUser(username, email, hashedPassword, role);

    return res.status(201).json({
      message: "ลงทะเบียนเรียบร้อย",
    });
  } catch (error) {
    next(error);
  }
};

exports.me = (req, res, next) => {
  const { _id, username, email, role, created_at } = req.user;

  return res.status(200).json({
    user: {
      id: _id,
      name: username,
      email: email,
      role: role,
      created_at: created_at,
    },
  });
};
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log(`changePassword) ${oldPassword} ${newPassword}`);
    const user = req.user; // นำข้อมูลผู้ใช้จากการตรวจสอบแล้ว

    // ตรวจสอบรหัสผ่านเดิม
    console.log(oldPassword);
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      const error = new Error("รหัสผ่านเดิมไม่ถูกต้อง");
      error.statusCode = 401;
      throw error;
    }

    // สร้างรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดตรหัสผ่านในฐานข้อมูล
    await UserModel.updatePassword(user.id, hashedPassword);

    return res.status(200).json({
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteDataUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // เรียกใช้งานโมเดลเพื่อลบข้อมูลผู้ใช้งาน
    await UserModel.deleteUserById(userId);

    // ส่งคำตอบกลับว่าลบข้อมูลเรียบร้อย
    return res.status(200).json({
      message: "ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว",
    });
  } catch (error) {
    next(error);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const user = await UserModel.getUserById(userId);
    // สร้างรหัสผ่านสุ่ม
    const newPassword = Math.random().toString(36).slice(-8); // สร้างรหัสผ่านสุ่ม 8 ตัวอักษร

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // บันทึกรหัสผ่านใหม่ลงในฐานข้อมูล
    await UserModel.updatePassword(userId, hashedPassword);
    // ส่งข้อความแจ้งเตือนไปยังกลุ่ม Line Notify
    // const lineNotifyToken = process.env.LINE_NOTIFY_TOKEN;  // แทนที่ด้วย Token ของกลุ่ม Line Notify ของคุณ
    // const message = `รหัสผ่านใหม่ของ ${user.username}  \n (${user.email})  \n คือ: ${newPassword}`;

    // await axios.post(
    //   "https://notify-api.line.me/api/notify",
    //   { message },
    //   {
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded",
    //       Authorization: `Bearer ${lineNotifyToken}`,
    //     },
    //   }
    // );

    return res.status(200).json({
      message: "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว",
      newPassword: newPassword, // ส่งรหัสผ่านใหม่กลับไปยังผู้ใช้งาน
    });
  } catch (error) {
    next(error);
  }
};
