require('dotenv').config();
// const jwtSecret = process.env.JWT_SECRET;
// module.exports = jwtSecret
const config = {
    jwtSecret: process.env.JWT_SECRET // ตั้งค่าเป็นคีย์ของคุณ
  };
  
  module.exports = config;