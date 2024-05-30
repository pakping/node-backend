// controllers/sellEggController.js
const SellEgg = require("../models/SellEgg");

exports.sellEgg = async (req, res) => {
  const { eggPanel, eggSize, eggsCount, totalPrice, note } = req.body;
  try {
    // สร้างข้อมูลการขายไข่ใหม่
    const parsedEggPanel = parseInt(eggPanel);
    const parsedEggSize = parseInt(eggSize);
    const parsedEggCount = parseInt(eggsCount);
    const parsedtotalPrice = parseInt(totalPrice);
    const newSellEggId = await SellEgg.create(
      eggPanel,
      eggSize,
      eggsCount,
      totalPrice,
      note
    );

    res.status(201).json({
      message: "Success",
      id: newSellEggId,
      eggPanel: parsedEggPanel, // จำนวน eggPanel ที่ขายออกไป
      eggsCount: parsedEggCount, // จำนวน eggsCount ที่ขายออกไป (จำนวนที่ไม่ถึง 30 ฟอง)
      totalPrice: parsedtotalPrice,
      eggSize: parsedEggSize,
    });
  } catch (error) {
    console.error("Error occurred while recording sale egg data:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
exports.getSoldEggs = async (req, res) => {
  const { date } = req.query;
  try {
    let soldEggs;
    if (date) {
      // ดึงรายการขายไข่ตามวันที่กำหนด
      soldEggs = await SellEgg.getByDate(date);
    } else {
      // ดึงรายการขายไข่ทั้งหมด
      soldEggs = await SellEgg.getAll();
    }

    res.status(200).json({
      message: "Success",
      data: soldEggs,
    });
  } catch (error) {
    console.error("Error occurred while fetching sold eggs:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.getSalesSummary = async (req, res) => {
  try {
    // ดึงข้อมูลสรุปยอดขายทั้งหมด
    const totalSalesSummary = await SellEgg.getTotalSalesSummary();

    // ดึงข้อมูลสรุปยอดขายตามขนาดของไข่
    const salesSummaryBySize = await SellEgg.getSalesSummaryBySize();

    // สร้างข้อมูลตามรูปแบบที่ต้องการ
    const formattedData = totalSalesSummary.map((summary, index) => ({
      [`totalSalesSummary-${summary.sale_date}`]: [summary],

      salesSummaryBySize: salesSummaryBySize,
    }));

    res.status(200).json({
      message: "Success",
      SummarySell: formattedData,
    });
  } catch (error) {
    console.error("Error occurred while fetching sales summary:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
