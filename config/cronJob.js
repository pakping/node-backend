// config/cronJob.js

const cron = require("node-cron");
const eggStorageController = require("../controllers/eggStorageController");

const setupCronJob = () => {
  // ตั้งค่าให้ฟังก์ชัน createDailyEgg ทำงานทุกๆ 1 ชั่วโมง
  cron.schedule('0 * * * *', async () => {
    try {
      // เรียกใช้ฟังก์ชันสร้างหรืออัพเดทข้อมูลรายวัน
      await eggStorageController.createDailyEgg();
      console.log("cron job created successfully");
    } catch (error) {
      console.error("Error occurred while running cron job:", error);
    }
  });
};

module.exports = setupCronJob;
