// models/EggStorage.js

const db = require("../config/index");

const EggStorage = {
  create: async function (houseId, eggsCount, eggSize) {
    const [result, fields] = await db.query(
      "INSERT INTO egg_storage (house_id, eggs_count, egg_size) VALUES (?, ?, ?)",
      [houseId, eggsCount, eggSize]
    );
    return result.insertId;
  },
  getAll: async function () {
    const [rows, fields] = await db.query("SELECT * FROM egg_storage");
    return rows;
  },
  getByDate: async function (date) {
    const [rows, fields] = await db.query('SELECT * FROM egg_storage WHERE created_at BETWEEN ? AND ?', [`${date} 00:00:00`, `${date} 23:59:59`]);
    return rows;
}

};

module.exports = EggStorage;
