const db = require("../config/index");

const House = {
  getAll: async function () {
    const [rows, fields] = await db.query("SELECT * FROM houses");
    return rows;
  },
  getById: async function (id) {
    const [rows, fields] = await db.query("SELECT * FROM houses WHERE id = ?", [id]);
    return rows[0];
  },
  create: async function (name, chickenBreed, building, chickenCount) {
    const [result, fields] = await db.query("INSERT INTO houses (name, chicken_breed, building, chicken_count) VALUES (?, ?, ?, ?)", [name, chickenBreed, building, chickenCount]);
    return result.insertId;
  },
  update: async function (id, name, chickenBreed, building, chickenCount) {
    const [result, fields] = await db.query("UPDATE houses SET name = ?, chicken_breed = ?, building = ?, chicken_count = ? WHERE id = ?", [name, chickenBreed, building, chickenCount, id]);
    return result.affectedRows;
  },
  delete: async function (id) {
    const [result, fields] = await db.query("DELETE FROM houses WHERE id = ?", [id]);
    return result.affectedRows;
  }
};

module.exports = House;
