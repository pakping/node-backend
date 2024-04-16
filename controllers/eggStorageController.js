// controllers/eggStorageController.js
const cron = require("node-cron");
const EggStorage = require("../models/EggStorage");
const House = require("../models/house");
const db = require("../config/index");
exports.create = async (req, res, next) => {
  try {
    const { houseId, eggsCount, eggSize } = req.body;
    // console.log(req.json());
    // ทำการสร้างข้อมูลในตาราง EggStorage โดยไม่รวมเวลาและวันที่
    const insertId = await EggStorage.create(houseId, eggsCount, eggSize);
    res.status(201).json({
      message: "Egg storage record created successfully",
      id: insertId,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const eggStorageData = await EggStorage.getAll();
    const eggStorageWithHouseData = await Promise.all(
      eggStorageData.map(async (storage) => {
        const houseId = storage.house_id;
        // console.log(houseId);
        // เรียกใช้ฐานข้อมูลเพื่อค้นหาข้อมูลของบ้านตาม houseId
        const [houseRows] = await db.query(
          "SELECT * FROM houses WHERE id = ?",
          [houseId]
        );
        const houseData = houseRows[0]; // เนื่องจาก houseId เป็น unique ดังนั้นจะมีแค่ record เดียว
        return {
          id: storage.id,
          houseName: houseData.name,
          eggsCount: storage.eggs_count,
          eggSize: storage.egg_size,
          createdAt: storage.created_at,
          updatedAt: storage.updated_at,
        };
      })
    );
    res.status(200).json({
      data: eggStorageWithHouseData,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
exports.getByDate = async (req, res, next) => {
  try {
    const created_at = req.params.date; // แก้เป็น created_at
    const data = await EggStorage.getByDate(created_at); // แก้เป็น created_at
    res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.createDailyEgg = async () => {
  try {
    const today = new Date(); // สร้างวัตถุของวันที่ปัจจุบัน
    const todayISODate = today.toISOString().slice(0, 10); // กำหนดรูปแบบวันที่ใน ISO 8601 (YYYY-MM-DD)

    // เช็คว่าข้อมูลสำหรับวันนี้ถูกสรุปแล้วหรือยัง
    const isDailySummaryExist = await EggStorage.isDailySummaryExist(
      todayISODate
    );
    if (!isDailySummaryExist) {
      // ถ้ายังไม่ได้สรุปข้อมูลสำหรับวันนี้

      // ดึงข้อมูลจากตาราง egg_storage เพื่อสรุป
      const [eggStorageRows] = await db.query(
        "SELECT egg_size, SUM(eggs_count) AS eggsCount FROM egg_storage WHERE DATE(created_at) = ? GROUP BY egg_size",
        [todayISODate]
      );

      // สร้างข้อมูลสำหรับการสรุปแต่ละขนาดของไข่
      const dailyEggData = eggStorageRows.map((row) => {
        return {
          egg_size: row.egg_size,
          eggs_count: row.eggsCount,
        };
      });

      // สรุปข้อมูลและบันทึกลงในตาราง daily_egg_storage
      await EggStorage.createDailyEgg(todayISODate, dailyEggData);

      console.log(`Summary for ${todayISODate} stored successfully.`);
    } else {
      // ถ้าข้อมูลสำหรับวันนี้ถูกสรุปแล้ว
      // อัพเดทข้อมูลในตาราง daily_egg_storage ด้วยข้อมูลใหม่จาก egg_storage
      // โดยต้องดึงข้อมูลจาก egg_storage อีกครั้ง
      const [eggStorageRows] = await db.query(
        "SELECT egg_size, SUM(eggs_count) AS eggsCount FROM egg_storage WHERE DATE(created_at) = ? GROUP BY egg_size",
        [todayISODate]
      );

      // สร้างข้อมูลสำหรับการสรุปแต่ละขนาดของไข่
      const dailyEggData = eggStorageRows.map((row) => {
        return {
          egg_size: row.egg_size,
          eggs_count: row.eggsCount,
        };
      });
      // console.log("dailyEggData", dailyEggData);
      // อัพเดทข้อมูลในตาราง daily_egg_storage
      await EggStorage.updateDailyEgg(todayISODate, dailyEggData);

      console.log(`Daily summary updated for ${todayISODate}.`);
    }
  } catch (error) {
    console.error("Error occurred while summarizing egg storage:", error);
  }
};
// สร้าง Cron Job เมื่อเรียกใช้งาน API นี้
exports.triggerCronJob = async (req, res) => {
  try {
    exports.createDailyEgg();
    res.status(200).json({ message: "Cron Job triggered successfully" });
  } catch (error) {
    console.error("Error occurred while triggering Cron Job:", error);
    res.status(500).json({ error: "Failed to trigger Cron Job" });
  }
};

exports.getAllDailyEggStorage = async (req, res) => {
  try {
    const dailyEggStorage = await EggStorage.getAllDailyEggStorage();
    res.json(dailyEggStorage); 
  } catch (error) {
    console.error("Error occurred while fetching daily egg storage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
