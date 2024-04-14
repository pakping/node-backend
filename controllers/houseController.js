const House = require("../models/house");

exports.getAllHouses = async (req, res, next) => {
  try {
    const houses = await House.getAll();
    res.status(200).json({
      data: houses,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getHouseById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const house = await House.getById(id);
    if (!house) {
      return res.status(404).json({
        error: "House not found",
      });
    }
    res.status(200).json({
      data: house,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.createHouse = async (req, res, next) => {
  const { name, chickenBreed, building, chickenCount } = req.body;
  try {
    const newHouseId = await House.create(
      name,
      chickenBreed,
      building,
      chickenCount
    );
    res.status(201).json({
      message: "House created successfully",
      id: newHouseId,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.updateHouse = async (req, res, next) => {
  const { id } = req.params;
  const { name, chickenBreed, building, chickenCount } = req.body;
 
  try {
    const affectedRows = await House.update(
      id,
      name,
      chickenBreed,
      building,
      chickenCount
    );
    if (affectedRows === 0) {
      return res.status(404).json({
        error: "House not found",
      });
    }
    res.status(200).json({
      message: "House updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.deleteHouse = async (req, res, next) => {
  const { id } = req.params;
  try {
    const affectedRows = await House.delete(id);
    if (affectedRows === 0) {
      return res.status(404).json({
        error: "House not found",
      });
    }
    res.status(200).json({
      message: "House deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
