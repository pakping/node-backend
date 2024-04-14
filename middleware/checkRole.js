// middleware/checkRole.js
const db = require("../config/index");

module.exports.isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id; // หรือวิธีอื่น ๆ ที่คุณใช้เพื่อเข้าถึงข้อมูลผู้ใช้
    const [rows, fields] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
    const userRole = rows[0].role;
    if (userRole === "admin") {
      next();
    } else {
      return res.status(403).json({
        error: {
          message: "ไม่มีสิทธ์",
        },
      });
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    return res.status(500).json({ error: "เกิดข้อผิดพลาดในการตรวจสอบบทบาทผู้ใช้" });
  }
};
