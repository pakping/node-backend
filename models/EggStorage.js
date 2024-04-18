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
      "INSERT INTO daily_egg_storage (date, eggs_count, egg_size_summary) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE eggs_count = VALUES(eggs_count), egg_size_summary = VALUES(egg_size_summary)",
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
    try {
        // ดึงข้อมูลเก่าจากตาราง daily_egg_storage ก่อน
        const oldEggData = await this.getByDateDailyEggStorage(date);

        // ถ้ามีข้อมูลเก่าในตาราง daily_egg_storage ให้ดำเนินการตามเงื่อนไข
        if (oldEggData.length > 0) {
            // ดึงค่า eggs_count_after จากข้อมูลเก่า
            const eggsCountAfter = oldEggData[0].eggs_count_after;

            // ดึงค่า eggs_count_before จากข้อมูลเก่า
            const eggsCountBefore = oldEggData[0].eggs_count_before;

            // คำนวณค่า eggs_count_after ใหม่
            let totalEggsCount = 0;
            dailyEggData.forEach(({ eggs_count }) => {
                totalEggsCount += parseInt(eggs_count); // หรือใช้ Number(eggs_count)
            });

            // ตรวจสอบว่าค่า eggs_count มีการเปลี่ยนแปลงหรือไม่
            if (totalEggsCount !== oldEggData[0].eggs_count) {
                // ถ้ามีการเปลี่ยนแปลงให้อัพเดทค่า eggs_count_after และ eggs_count_before
                const newEggsCountBefore = eggsCountAfter;
                const newDataChanged = 1;

                // สร้างข้อมูลสรุปรายวันใหม่
                const eggSizeSummary = {};
                dailyEggData.forEach(({ egg_size, eggs_count }) => {
                    if (eggSizeSummary[egg_size]) {
                        eggSizeSummary[egg_size] += eggs_count;
                        eggSizeSummary[egg_size].egg_panel = Math.floor(eggSizeSummary[egg_size].eggs_count / 30);
                    } else {
                        eggSizeSummary[egg_size] = {
                            egg_size,
                            eggs_count,
                            egg_panel: Math.floor(eggs_count / 30),
                            Less_than_Panel_Eggs: eggs_count % 30,
                        };
                    }
                });

                // อัพเดทข้อมูลในตาราง daily_egg_storage
                const sql = `UPDATE daily_egg_storage SET egg_size_summary = ?, eggs_count = ?, eggs_count_before = ?, eggs_count_after = ?, data_changed = ? WHERE date = ?`;
                const values = [JSON.stringify(eggSizeSummary), totalEggsCount, newEggsCountBefore, totalEggsCount, newDataChanged, date];

                const [result, fields] = await db.query(sql, values);

                return result.changedRows;
            } else {
                // ถ้าไม่มีการเปลี่ยนแปลงใน eggs_count ให้ออกจากฟังก์ชันโดยไม่ทำอะไร
                return 0;
            }
        } else {
            // ถ้าไม่มีข้อมูลเก่าในตาราง daily_egg_storage ให้กำหนด eggs_count_before และ eggs_count_after เป็น 0
            const newEggsCountBefore = 0;
            const newDataChanged = 1;

            // คำนวณค่า eggs_count_after ใหม่
            let totalEggsCount = 0;
            dailyEggData.forEach(({ eggs_count }) => {
                totalEggsCount += parseInt(eggs_count); // หรือใช้ Number(eggs_count)
            });

            // สร้างข้อมูลสรุปรายวันใหม่
            const eggSizeSummary = {};
            dailyEggData.forEach(({ egg_size, eggs_count }) => {
                if (eggSizeSummary[egg_size]) {
                    eggSizeSummary[egg_size] += eggs_count;
                    eggSizeSummary[egg_size].egg_panel = Math.floor(eggSizeSummary[egg_size].eggs_count / 30);
                } else {
                    eggSizeSummary[egg_size] = {
                        egg_size,
                        eggs_count,
                        egg_panel: Math.floor(eggs_count / 30),
                        Less_than_Panel_Eggs: eggs_count % 30,
                    };
                }
            });

            // อัพเดทข้อมูลในตาราง daily_egg_storage
            const sql = `UPDATE daily_egg_storage SET egg_size_summary = ?, eggs_count = ?, eggs_count_before = ?, eggs_count_after = ?, data_changed = ? WHERE date = ?`;
            const values = [JSON.stringify(eggSizeSummary), totalEggsCount, newEggsCountBefore, totalEggsCount, newDataChanged, date];

            const [result, fields] = await db.query(sql, values);

            return result.changedRows;
        }
    } catch (error) {
        console.error("Error occurred while updating daily egg:", error);
        throw error;
    }
},


  getAllDailyEggStorage: async function () {
    const [rows, fields] = await db.query("SELECT * FROM `daily_egg_storage`");
    return rows;
  },
  getByDateDailyEggStorage: async function (date) {
    const [rows, fields] = await db.query(
      "SELECT * FROM `daily_egg_storage` WHERE date = ?",
      [date]
    );
    return rows;
  },
};

module.exports = EggStorage;
