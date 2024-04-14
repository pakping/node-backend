const db = require("../config/index");
// Function to handle role creation
exports.index = async (req, res, next) => {
    try {
      const [rows, fields] = await db.query('SELECT * FROM roles ORDER BY id DESC');
      res.status(200).json({ data: rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };