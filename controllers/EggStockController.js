// controllers/eggStockController.js
const DailyEggStorage = require("../models/dailyEggStorage");
const EggStock = require("../models/eggStock");



exports.addEggToStock = async (req, res) => {
  try {
    // เรียกใช้งานฟังก์ชัน updateEggStockFromDailyEggStorage เพื่ออัปเดตข้อมูลใน egg_stock จาก dailyEggStorage
    await EggStock.updateEggStockFromDailyEggStorage();
    
    res.status(200).json({ message: "Eggs added to stock successfully" });
  } catch (error) {
    console.error("Error occurred while adding eggs to stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.removeEggFromStock = async (req, res) => {
  try {
    const { eggData } = req.body;
    const result = await EggStock.removeEggFromStock(eggData);
    res
      .status(200)
      .json({
        message: "Egg removed from stock successfully",
        affectedRows: result,
      });
  } catch (error) {
    console.error("Error occurred while removing egg from stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllEggStock = async (req, res) => {
  try {
    const eggStock = await EggStock.getAllEggStock();
    res.status(200).json(eggStock);
  } catch (error) {
    console.error("Error occurred while getting all egg stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.updateEggStockFromDailyEggStorage = async () => {
  try {
    // Get all daily egg storage records
    const dailyEggStorage = await DailyEggStorage.getAllDailyEggStorage();
    
    // Initialize an object to store updated egg stock data
    const updatedEggStock = {};
    
    // Loop through each daily egg storage record
    for (const record of dailyEggStorage) {
      const eggSizeSummaryData = JSON.parse(record.egg_size_summary);
      // Loop through each egg size summary in the record
      for (const eggSize in eggSizeSummaryData) {
        if (Object.hasOwnProperty.call(eggSizeSummaryData, eggSize)) {
          const { eggs_count, egg_panel, Less_than_Panel_Eggs } = eggSizeSummaryData[eggSize];
          // Check if the egg size already exists in updatedEggStock
          if (!updatedEggStock[eggSize]) {
            // If it doesn't exist, initialize the egg stock data
            updatedEggStock[eggSize] = { eggs_count: 0, egg_panel: 0, Less_than_Panel_Eggs: 0 };
          }
          // Add the eggs_count, egg_panel, and Less_than_Panel_Eggs to the corresponding egg size in updatedEggStock
          updatedEggStock[eggSize].eggs_count += parseInt(eggs_count);
          updatedEggStock[eggSize].egg_panel += parseInt(egg_panel);
          updatedEggStock[eggSize].Less_than_Panel_Eggs += parseInt(Less_than_Panel_Eggs);
        }
      }
    }
    
    // Loop through updatedEggStock and update the egg stock data
    for (const eggSize in updatedEggStock) {
      if (Object.hasOwnProperty.call(updatedEggStock, eggSize)) {
        const { eggs_count, egg_panel, Less_than_Panel_Eggs } = updatedEggStock[eggSize];
        // Update the egg stock data in the database
        await EggStock.updateEggStock(eggSize, eggs_count, egg_panel, Less_than_Panel_Eggs);
      }
    }
    
    console.log("Egg stock updated successfully from daily egg storage");
  } catch (error) {
    console.error("Error occurred while updating egg stock from daily egg storage:", error);
    throw error;
  }
};
exports.updateEggStock = async (req, res) => {
  try {
    // ดึงข้อมูลจากตาราง daily_egg_storage
    const dailyEggStorage = await DailyEggStorage.getAllDailyEggStorage();
    console.log('dailyEggStorage :', dailyEggStorage);
    
    for (const data of dailyEggStorage) {
      const eggSizeSummaryData = JSON.parse(data.egg_size_summary);
      for (const eggSize in eggSizeSummaryData) {
        if (Object.hasOwnProperty.call(eggSizeSummaryData, eggSize)) {
          const { eggs_count, egg_panel, Less_than_Panel_Eggs } = eggSizeSummaryData[eggSize];
          // Check if egg_size exists in the egg_stock table
          const existingEggStock = await EggStock.getEggStockBySize(eggSize);
          if (existingEggStock) {
            // If egg_size exists, update the existing record
            await EggStock.updateEggStock(eggSize, eggs_count, egg_panel, Less_than_Panel_Eggs);
          } else {
            // If egg_size does not exist, add a new record
            await EggStock.addEggToStock(eggSize, eggs_count, egg_panel, Less_than_Panel_Eggs);
          }
        }
      }
    }

    // อัพเดตข้อมูลใน egg_stock โดยลบข้อมูลที่ขายออกจาก egg_stock
    const { eggSize, eggsCount } = req.body; // แก้ตามชื่อตัวแปรที่ใช้ใน request body
    await EggStock.removeEggFromStock(eggSize, eggsCount);

    res.status(200).json({ message: "Egg stock updated successfully" });
  } catch (error) {
    console.error("Error occurred while updating egg stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};