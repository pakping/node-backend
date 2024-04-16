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
    const [rows, fields] = await db.query(
      "SELECT * FROM egg_storage WHERE created_at BETWEEN ? AND ?",
      [`${date} 00:00:00`, `${date} 23:59:59`]
    );
    return rows;
  },
  getDailyRecord: async function (date) {
    const [rows, fields] = await db.query(
      "SELECT * FROM daily_egg_storage WHERE date = ?",
      [date]
    );
    return rows[0];
  },
  createDailyEgg: async function (date, dailyEggData) {
    let totalEggsCount = 0;
    dailyEggData.forEach(({ eggs_count }) => {
      totalEggsCount += parseInt(eggs_count);
    });

    const eggSizeSummary = dailyEggData.reduce(
      (summary, { egg_size, eggs_count }) => {
        summary[egg_size] = (summary[egg_size] || 0) + parseInt(eggs_count);
        return summary;
      },
      {}
    );

    const eggSizeSummaryJSON = JSON.stringify(eggSizeSummary);

    const [result, fields] = await db.query(
      "INSERT INTO daily_egg_storage (date, eggs_count, egg_size_summary) VALUES (?, ?, ?)",
      [date, totalEggsCount, eggSizeSummaryJSON]
    );
    return result;
  },

  isDailySummaryExist: async function (date) {
    const [rows, fields] = await db.query(
      "SELECT COUNT(*) AS count FROM daily_egg_storage WHERE date = ?",
      [date]
    );
    return rows[0].count > 0;
  },
  updateDailyEgg: async function (date, dailyEggData) {
    // คำนวณผลรวมของ eggs_count ทั้งหมดจาก dailyEggData
    let totalEggsCount = 0;
    dailyEggData.forEach(({ eggs_count }) => {
      totalEggsCount += parseInt(eggs_count); // หรือใช้ Number(eggs_count)
    });
    // สร้างข้อมูลสรุปรายวันใหม่
    const eggSizeSummary = {};
    dailyEggData.forEach(({ egg_size, eggs_count }) => {
      if (eggSizeSummary[egg_size]) {
        eggSizeSummary[egg_size] += eggs_count;
      } else {
        eggSizeSummary[egg_size] = eggs_count;
      }
    });

    // สร้างคำสั่ง SQL เพื่ออัปเดตข้อมูลในตาราง daily_egg_storage
    const sql = `UPDATE daily_egg_storage SET egg_size_summary = ?, eggs_count = ? WHERE date = ?`;
    const values = [JSON.stringify(eggSizeSummary), totalEggsCount, date];

    const [result, fields] = await db.query(sql, values);
    return result.changedRows;
  },

  getAllDailyEggStorage: async function () {
    const [rows, fields] = await db.query("SELECT * FROM `daily_egg_storage`");
    return rows;
  },
};

module.exports = EggStorage;
