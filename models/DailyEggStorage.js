const db = require("../config/index");

const DailyEggStorage = {
  // ฟังก์ชันสำหรับดึงข้อมูลทั้งหมดในตาราง daily_egg_storage
  getAllDailyEggStorage: async function () {
    try {
      const [rows, fields] = await db.query("SELECT * FROM daily_egg_storage");
      return rows;
    } catch (error) {
      console.error("Error occurred while fetching all daily egg storage:", error);
      throw error;
    }
  },
};

module.exports = DailyEggStorage;
