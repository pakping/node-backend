// models/SellEgg.js
const db = require("../config/index");
const moment = require("moment");
const SellEgg = {
  create: async function (eggPanel, eggSize, eggsCount, totalPrice, note) {
    const sql = `
      INSERT INTO sell_egg (egg_panel, egg_size, eggs_count, total_price, note)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [eggPanel, eggSize, eggsCount, totalPrice, note];

    try {
      // ทำการบันทึกข้อมูลการขายไข่
      const [result, fields] = await db.query(sql, values);

      return result.insertId;
    } catch (error) {
      console.error("Error occurred while creating sell egg record:", error);
      throw error;
    }
  },
  getByDate: async function (date) {
    const sql = "SELECT * FROM sell_egg WHERE DATE(date) = ?";
    try {
      const [rows, fields] = await db.query(sql, [date]);
      return rows;
    } catch (error) {
      console.error("Error occurred while fetching sold eggs by date:", error);
      throw error;
    }
  },

  getAll: async function () {
    const sql = "SELECT * FROM sell_egg";
    try {
      const [rows, fields] = await db.query(sql);
      return rows;
    } catch (error) {
      console.error("Error occurred while fetching all sold eggs:", error);
      throw error;
    }
  },
  getTotalSalesSummary: async function () {
    const sql = `
      SELECT 
          DATE(created_at) AS sale_date,
          SUM(total_price) AS total_revenue,
          SUM(egg_panel) AS total_panels_sold,
          SUM(eggs_count) AS total_eggs_count
      FROM 
          sell_egg
      GROUP BY 
          sale_date
    `;
    try {
      const [rows, fields] = await db.query(sql);
      const processedSummary = rows.map((row) => {
        const { total_revenue, total_panels_sold, total_eggs_count } = row;
        // คำนวณจำนวนแผงที่ขายได้จาก eggs_count
        const panels_from_eggs_count = Math.floor(total_eggs_count / 30);
        // คำนวณ eggs_count ที่เหลือหลังจากนำมาเป็นแผง
        const remaining_eggs_count = total_eggs_count % 30;
        return {
          sale_date: moment(row.sale_date).format("YYYY-MM-DD"), // ตัดเวลาออกและเหลือแค่วันที่
          total_revenue: parseFloat(total_revenue),
          total_panels_sold:
            parseFloat(total_panels_sold) + parseFloat(panels_from_eggs_count),
          eggs_count: parseFloat(remaining_eggs_count),
          panels_from_eggs_count: parseFloat(panels_from_eggs_count),
        };
      });
      return processedSummary;
    } catch (error) {
      console.error(
        "Error occurred while fetching total sales summary:",
        error
      );
      throw error;
    }
  },

  // ฟังก์ชันสำหรับสรุปยอดขายตามขนาดของไข่
  getSalesSummaryBySize: async function () {
    const sql = `
      SELECT 
          egg_size,
          SUM(total_price) AS total_revenue,
          SUM(egg_panel) AS total_panels,
          SUM(eggs_count) AS total_eggs_count
      FROM 
          sell_egg
      GROUP BY 
          egg_size
    `;
    try {
      const [rows, fields] = await db.query(sql);
      const processedSummary = rows.map((row) => {
        const { total_panels, total_eggs_count } = row;
        // คำนวณจำนวนแผงจาก eggs_count
        const panels_from_eggs_count = Math.floor(total_eggs_count / 30);
        // คำนวณ eggs_count ที่เหลือหลังจากนำมาเป็นแผง
        const remaining_eggs_count = total_eggs_count % 30;
        // รวมจำนวนแผงที่ขายได้
        const total_panels_sold =
          parseFloat(total_panels) + parseFloat(panels_from_eggs_count);
        return {
          egg_size: row.egg_size,
          total_revenue: parseFloat(row.total_revenue),
          total_panels: parseFloat(total_panels_sold),
          eggs_count: parseFloat(remaining_eggs_count),
        };
      });
      return processedSummary;
    } catch (error) {
      console.error(
        "Error occurred while fetching sales summary by size:",
        error
      );
      throw error;
    }
  },
};

module.exports = SellEgg;
