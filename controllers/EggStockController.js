// controllers/eggStockController.js
const DailyEggStorage = require("../models/dailyEggStorage");
const EggStock = require("../models/EggStock");

exports.addEggToStock = async (req, res) => {
  try {
    // เรียกใช้งานฟังก์ชัน updateEggStockFromDailyEggStorage เพื่ออัปเดตข้อมูลใน egg_stock จาก dailyEggStorage
    await EggStock.updateEggStockFromDailyEggStorage();
    
    res.status(200).json({ message: "เพิ่มไข่ในสต็อกสำเร็จ" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดขณะเพิ่มไข่ในสต็อก:", error);
    res.status(500).json({ error: "ข้อผิดพลาดของเซิร์ฟเวอร์ภายใน" });
  }
};

exports.removeEggFromStock = async (req, res) => {
  try {
    const { eggData } = req.body;
    const result = await EggStock.removeEggFromStock(eggData);
    res.status(200).json({
      message: "ลบไข่ออกจากสต็อกสำเร็จ",
      affectedRows: result,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดขณะลบไข่ออกจากสต็อก:", error);
    res.status(500).json({ error: "ข้อผิดพลาดของเซิร์ฟเวอร์ภายใน" });
  }
};

exports.getAllEggStock = async (req, res) => {
  try {
    const eggStock = await EggStock.getAllEggStock();
    res.status(200).json(eggStock);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดขณะดึงข้อมูลไข่ทั้งหมดในสต็อก:", error);
    res.status(500).json({ error: "ข้อผิดพลาดของเซิร์ฟเวอร์ภายใน" });
  }
};

exports.updateEggStockFromDailyEggStorage = async () => {
  try {
    // ดึงข้อมูลจาก daily_egg_storage ทั้งหมด
    const dailyEggStorage = await DailyEggStorage.getAllDailyEggStorage();
    
    // สร้างออบเจกต์เพื่อเก็บข้อมูลสต็อกไข่ที่อัปเดต
    const updatedEggStock = {};
    
    // วนลูปผ่านแต่ละรายการใน daily_egg_storage
    for (const record of dailyEggStorage) {
      const eggSizeSummaryData = JSON.parse(record.egg_size_summary);
      // วนลูปผ่านแต่ละสรุปขนาดไข่ในรายการ
      for (const eggSize in eggSizeSummaryData) {
        if (Object.hasOwnProperty.call(eggSizeSummaryData, eggSize)) {
          const { eggs_count, egg_panel, Less_than_Panel_Eggs } = eggSizeSummaryData[eggSize];
          // ตรวจสอบว่าขนาดไข่มีอยู่ใน updatedEggStock หรือไม่
          if (!updatedEggStock[eggSize]) {
            // หากไม่มี ให้เริ่มต้นข้อมูลสต็อกไข่
            updatedEggStock[eggSize] = { eggs_count: 0, egg_panel: 0, Less_than_Panel_Eggs: 0 };
          }
          // เพิ่ม eggs_count, egg_panel, และ Less_than_Panel_Eggs ไปยังขนาดไข่ที่ตรงกันใน updatedEggStock
          updatedEggStock[eggSize].eggs_count += parseInt(eggs_count);
          updatedEggStock[eggSize].egg_panel += parseInt(egg_panel);
          updatedEggStock[eggSize].Less_than_Panel_Eggs += parseInt(Less_than_Panel_Eggs);
        }
      }
    }
    
    // วนลูปผ่าน updatedEggStock และอัปเดตข้อมูลสต็อกไข่
    for (const eggSize in updatedEggStock) {
      if (Object.hasOwnProperty.call(updatedEggStock, eggSize)) {
        const { eggs_count, egg_panel, Less_than_Panel_Eggs } = updatedEggStock[eggSize];
        // อัปเดตข้อมูลสต็อกไข่ในฐานข้อมูล
        await EggStock.updateEggStock(eggSize, eggs_count, egg_panel, Less_than_Panel_Eggs);
      }
    }
    
    console.log("อัปเดตสต็อกไข่สำเร็จจาก daily egg storage");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดขณะอัปเดตสต็อกไข่จาก daily egg storage:", error);
    throw error;
  }
};

exports.updateEggStock = async (req, res) => {
  try {
    // ดึงข้อมูลจากตาราง daily_egg_storage
    const dailyEggStorage = await DailyEggStorage.getAllDailyEggStorage();
    // console.log('dailyEggStorage :', dailyEggStorage);
    
    for (const data of dailyEggStorage) {
      const eggSizeSummaryData = JSON.parse(data.egg_size_summary);
      for (const eggSize in eggSizeSummaryData) {
        if (Object.hasOwnProperty.call(eggSizeSummaryData, eggSize)) {
          const { eggs_count, egg_panel, Less_than_Panel_Eggs } = eggSizeSummaryData[eggSize];
          // ตรวจสอบว่าขนาดไข่มีอยู่ในตาราง egg_stock หรือไม่
          const existingEggStock = await EggStock.getEggStockBySize(eggSize);
          if (existingEggStock) {
            // หากขนาดไข่มีอยู่ อัปเดตรายการที่มีอยู่
            await EggStock.updateEggStock(eggSize, eggs_count, egg_panel, Less_than_Panel_Eggs);
          } else {
            // หากขนาดไข่ไม่มีอยู่ เพิ่มรายการใหม่
            await EggStock.addEggToStock(eggSize, eggs_count, egg_panel, Less_than_Panel_Eggs);
          }
        }
      }
    }

    // อัปเดตข้อมูลใน egg_stock โดยลบข้อมูลที่ขายออกจาก egg_stock
    const { eggSize, eggsCount } = req.body; // แก้ตามชื่อตัวแปรที่ใช้ใน request body
    await EggStock.removeEggFromStock(eggSize, eggsCount);

    res.status(200).json({ message: "อัปเดตสต็อกไข่สำเร็จ" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดขณะอัปเดตสต็อกไข่:", error);
    res.status(500).json({ error: "ข้อผิดพลาดของเซิร์ฟเวอร์ภายใน" });
  }
};
