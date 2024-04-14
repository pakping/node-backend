// controllers/eggStorageController.js

const EggStorage = require("../models/EggStorage");
const House = require("../models/house");
const db = require("../config/index");
exports.create = async (req, res, next) => {
  try {
    const { houseId, eggsCount, eggSize } = req.body;
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
            data
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
