// models/userModel.js

const db = require("../config/index");

const UserModel = {
    getAllUsers: async () => {
        const [rows, fields] = await db.query('SELECT * FROM users ORDER BY id DESC');
        return rows;
    },

    getUserByEmail: async (email) => {
        const [rows, fields] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    },

    createUser: async (username, email, password) => {
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    }
};

module.exports = UserModel;
