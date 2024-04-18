// models/eggStock.js
const db = require("../config/index");
const DailyEggStorage = require("./dailyEggStorage");

const EggStock = {
  updateEggStock: async function (
    eggSize,
    eggsCount,
    eggPanel,
    Less_than_Panel_Eggs
  ) {
    try {
      const [result, fields] = await db.query(
        "UPDATE egg_stock SET eggs_count = ?, egg_panel = ?, Less_than_Panel_Eggs = ? WHERE egg_size = ?",
        [eggsCount, eggPanel, Less_than_Panel_Eggs, eggSize]
      );
      return result.affectedRows;
    } catch (error) {
      console.error("Error occurred while updating egg stock:", error);
      throw error;
    }
  },
  addEggToStock: async function (
    eggSize,
    eggsCount,
    eggPanel,
    Less_than_Panel_Eggs
  ) {
    try {
      const [result, fields] = await db.query(
        "INSERT INTO egg_stock (egg_size, eggs_count, egg_panel, Less_than_Panel_Eggs) VALUES (?, ?, ?, ?)",
        [eggSize, eggsCount, eggPanel, Less_than_Panel_Eggs]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error occurred while adding egg to stock:", error);
      throw error;
    }
  },
  removeEggFromStock: async function (eggSize, eggPaneltotanetl) {
    try {
      // ลบข้อมูลจากตาราง egg_stock
      const [result, fields] = await db.query(
        "DELETE FROM egg_stock WHERE egg_size = ? AND Less_than_Panel_Eggs = ?",
        [eggSize, eggPaneltotanetl]
      );

      // คำนวณค่า eggs_count, egg_panel, และ Less_than_Panel_Eggs ใหม่
      const remainingEggStock = await this.getEggStockBySize(eggSize);
      const updatedEggsCount = remainingEggStock.eggs_count - eggPaneltotanetl;
      const updatedEggPanel = Math.floor(updatedEggsCount / 30);
      const updatedLessThanPanelEggs = updatedEggsCount % 30;

      // อัปเดตข้อมูลในตาราง egg_stock
      await this.updateEggStock(
        eggSize,
        updatedEggsCount,
        updatedEggPanel,
        updatedLessThanPanelEggs
      );

      // ส่งข้อมูลที่ถูกลบกลับ
      return result.affectedRows;
    } catch (error) {
      console.error("Error occurred while removing egg from stock:", error);
      throw error;
    }
  },

  getAllEggStock: async function () {
    try {
      const [rows, fields] = await db.query("SELECT * FROM egg_stock");
      return rows;
    } catch (error) {
      console.error("Error occurred while getting all egg stock:", error);
      throw error;
    }
  },
  getEggStockBySize: async function (eggSize) {
    try {
      const [rows, fields] = await db.query(
        "SELECT * FROM egg_stock WHERE egg_size = ?",
        [eggSize]
      );
      return rows[0]; // Return the first row, assuming egg_size is unique
    } catch (error) {
      console.error("Error occurred while getting egg stock by size:", error);
      throw error;
    }
  },
  updateEggStockFromDailyEggStorage: async function () {
    try {
      // Get all daily egg storage records
      const dailyEggStorage = await DailyEggStorage.getAllDailyEggStorage();
      // console.log('dailyEggStorage :', dailyEggStorage);

      // Initialize an object to store updated egg stock data
      const updatedEggStock = {};

      // Loop through each daily egg storage record
      for (const record of dailyEggStorage) {
        const eggSizeSummaryData = JSON.parse(record.egg_size_summary);
        // Loop through each egg size summary in the record
        for (const eggSize in eggSizeSummaryData) {
          if (Object.hasOwnProperty.call(eggSizeSummaryData, eggSize)) {
            const { eggs_count, egg_panel, Less_than_Panel_Eggs } =
              eggSizeSummaryData[eggSize];
            // Check if the egg size already exists in updatedEggStock
            if (!updatedEggStock[eggSize]) {
              // If it doesn't exist, initialize the egg stock data
              updatedEggStock[eggSize] = {
                eggs_count: 0,
                egg_panel: 0,
                Less_than_Panel_Eggs: 0,
              };
            }
            // Add the eggs_count, egg_panel, and Less_than_Panel_Eggs to the corresponding egg size in updatedEggStock
            updatedEggStock[eggSize].eggs_count += parseInt(eggs_count);
            updatedEggStock[eggSize].egg_panel += parseInt(egg_panel);
            updatedEggStock[eggSize].Less_than_Panel_Eggs +=
              parseInt(Less_than_Panel_Eggs);
          }
        }
      }

      // Loop through updatedEggStock and update the egg stock data
      for (const eggSize in updatedEggStock) {
        if (Object.hasOwnProperty.call(updatedEggStock, eggSize)) {
          const { eggs_count, egg_panel, Less_than_Panel_Eggs } =
            updatedEggStock[eggSize];
          // Update the egg stock data in the database
          await this.updateEggStock(
            eggSize,
            eggs_count,
            egg_panel,
            Less_than_Panel_Eggs
          );
        }
      }

      console.log("Egg stock updated successfully from daily egg storage");
    } catch (error) {
      console.error(
        "Error occurred while updating egg stock from daily egg storage:",
        error
      );
      throw error;
    }
  },
};

module.exports = EggStock;
