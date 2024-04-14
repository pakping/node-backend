// controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");

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
            const error = new Error('ไม่พบผู้ใช้งานในระบบ');
            error.statusCode = 404;
            throw error;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            const error = new Error('รหัสผ่านไม่ถูกต้อง');
            error.statusCode = 401;
            throw error;
        }

        const token = await jwt.sign({
            id: user.id,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '5 days' });

        const expires_in = jwt.decode(token);

        return res.status(200).json({
            access_token: token,
            expires_in: expires_in.exp,
            token_type: 'Bearer'
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
        const error = new Error('อีเมล์ซ้ำ มีผู้ใช้งานแล้ว ลองใหม่อีกครั้ง');
        error.statusCode = 400;
        throw error;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await UserModel.createUser(username, email, hashedPassword);
  
      return res.status(201).json({
        message: 'ลงทะเบียนเรียบร้อย',
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
        created_at: created_at
      }
    });
}
