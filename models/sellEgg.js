// models/SellEgg.js
const db = require("../config/index");

const SellEgg = {
  create: async function (date, eggPanel, eggSize, eggsCount, totalPrice, note) {
    const sql = `
      INSERT INTO sell_egg (date, egg_panel, egg_size, eggs_count, total_price, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [date, eggPanel, eggSize, eggsCount, totalPrice, note];
    
    try {
      // ทำการบันทึกข้อมูลการขายไข่
      const [result, fields] = await db.query(sql, values);
      
      return result.insertId;
    } catch (error) {
      console.error("Error occurred while creating sell egg record:", error);
      throw error;
    }
  }
};

module.exports = SellEgg;
