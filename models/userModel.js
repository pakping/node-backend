// models/userModel.js

const db = require("../config/index");

const UserModel = {
  getAllUsers: async () => {
    const [rows, fields] = await db.query(
      "SELECT * FROM users ORDER BY id DESC"
    );
    return rows;
  },

  getUserByEmail: async (email) => {
    const [rows, fields] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  },

  createUser: async (username, email, password, role) => {
    await db.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, password, role]
    );
  },

  updatePassword: async (userId, newPassword) => {
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      newPassword,
      userId,
    ]);
  },
  deleteUserById: async (userId) => {
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
  },
  getUserById: async (userId) => {
    const [rows, fields] = await db.query(
      "SELECT username, email FROM users WHERE id = ?",
      [userId]
    );
    return rows[0] || null;
  },
  updateEggCount: async function (date, eggsCount) {
    const [result, fields] = await db.query(
      "UPDATE daily_egg_storage SET eggs_count = ? WHERE date = ?",
      [eggsCount, date]
    );
    return result.affectedRows;
  },
};

module.exports = UserModel;
