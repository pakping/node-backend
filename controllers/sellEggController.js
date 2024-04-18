// controllers/sellEggController.js
const SellEgg = require("../models/sellEgg");
const EggStock = require("../models/eggStock");
const Panel = 30;

exports.sellEgg = async (req, res) => {
  const { date, eggPanel, eggSize, eggsCount, totalPrice, note } = req.body;
  try {
    // แปลง eggPanel เป็นตัวเลข
    const parsedEggPanel = parseInt(eggPanel);
    
    const newSellEggId = await SellEgg.create(date, parsedEggPanel, eggSize, eggsCount, totalPrice, note);

    const eggPaneltota = parsedEggPanel * Panel;
    const eggPaneltotanet = eggPaneltota + parseInt(eggsCount);

    // ทำการลบข้อมูลใน egg_stock ตามจำนวนที่ขายออกไป
    await EggStock.removeEggFromStock(eggSize, eggPaneltotanet);

    // ดึงข้อมูล EggStock ล่าสุดหลังจากการลบไข่
    const latestEggStock = await EggStock.getEggStockBySize(eggSize);

    res.status(201).json({
      message: "Success",
      id: newSellEggId,
      eggPanel: parsedEggPanel, // จำนวน eggPanel ที่ขายออกไป
      eggsCount: parseInt(eggsCount), // จำนวน eggsCount ที่ขายออกไป (จำนวนที่ไม่ถึง 30 ฟอง)
      latestEggStock: latestEggStock // ข้อมูล EggStock ล่าสุดหลังจากการลบไข่
    });
  } catch (error) {
    console.error("Error occurred while recording sale egg data:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
