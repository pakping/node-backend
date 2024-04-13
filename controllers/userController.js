
const db = require("../config/index");
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.index = async (req, res, next) => {
    try {
      const [rows, fields] = await db.query('SELECT * FROM users ORDER BY id DESC');
      res.status(200).json({ data: rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Query ใน MySQL เพื่อค้นหาผู้ใช้ที่มีอีเมล์ตรงกับที่รับมา
        const [rows, fields] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        
        // ตรวจสอบว่าพบผู้ใช้หรือไม่
        if (rows.length === 0) {
            const error = new Error('ไม่พบผู้ใช้งานในระบบ');
            error.statusCode = 404;
            throw error;
        }

        // ตรวจสอบรหัสผ่าน
        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            const error = new Error('รหัสผ่านไม่ถูกต้อง');
            error.statusCode = 401;
            throw error;
        }
        // สร้าง token
        const token = await jwt.sign({
            id: user.id,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '5 days' });

        // Decode วันหมดอายุ
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
      console.log(username, email, password);
  
      // ตรวจสอบ validation
      // คำสั่ง validate อยู่นอกเหนือของขอบเขตของคำถาม คุณสามารถใช้ express-validator หรือวิธีการตรวจสอบอื่น ๆ ตามที่คุณต้องการ
  
      // ตรวจสอบว่ามีอีเมล์ซ้ำหรือไม่
      const [rows, fields] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        const error = new Error('อีเมล์ซ้ำ มีผู้ใช้งานแล้ว ลองใหม่อีกครั้ง');
        error.statusCode = 400;
        throw error;
      }
  
      // แฮชรหัสผ่านก่อนบันทึกลงฐานข้อมูล
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // บันทึกข้อมูลผู้ใช้ลงในฐานข้อมูล
      await db.query('INSERT INTO users (username,email, password) VALUES (? ,? , ?)', [username,email, hashedPassword]);
  
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
        created_at:created_at
      }
    });
  }
  