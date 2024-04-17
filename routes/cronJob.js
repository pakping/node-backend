const express = require('express');
const router = express.Router();
const passportJWT = require('../middleware/passportJWT');
const eggStorageController = require('../controllers/eggStorageController');

// API สำหรับเรียกใช้งาน Cron Job
router.post('/trigger-cron-job', passportJWT.isLogin, eggStorageController.triggerCronJob);
router.get("/daily-egg-storage",passportJWT.isLogin, eggStorageController.getAllDailyEggStorage);
router.get("/daily-egg-storage-date/:date",passportJWT.isLogin, eggStorageController.getByDateDailyEggStorage);
module.exports = router;
