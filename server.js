// Import libraries
const express = require("express");
const cors = require("cors");
// const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// app.get("/users", (req, res, next) => {
//   connection.query("SELECT * FROM `daily_egg_storage`", function (err, results, fields) {
//     if (err) {
//       console.error("Error querying database:", err);
//       return res.status(500).json({ error: 'Failed to fetch users' });
//     }
//     res.json(results);
//   });
// });

// app.get("/users/:id", (req, res, next) => {
//   const id = req.params.id;
//   connection.query(
//     "SELECT * FROM `users` WHERE `id` = ?",
//     [id],
//     function (err, results) {
//       if (err) {
//         // ในกรณีเกิดข้อผิดพลาดในการสอบถามฐานข้อมูล
//         console.error("Error querying database:", err);
//         res.status(500).json({
//           error: "Internal server error",
//         });
//         return;
//       }

//       if (results.length === 0) {
//         // ในกรณีไม่พบผู้ใช้ที่มี ID ที่ระบุ
//         res.status(404).json({
//           error: "User not found",
//         });
//         return;
//       }

//       // ในกรณีพบผู้ใช้ที่มี ID ที่ระบุ
//       res.json(results[0]);
//     }
//   );
// });

// app.post("/users", function (req, res, next) {
//   const {
//     username,
//     email,
//     password,
//     role
//   } = req.body;


//   if (!username || !email || !password || !role) {
//     return res.status(400).json({
//       error: "All fields are required"
//     });
//   }

//   connection.query(
//     "INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES (?, ?, ?, ?)",
//     [username, password, email, role],
//     function (err, results) {
//       if (err) {
//         console.error("Error creating user:", err);
//         return res.status(500).json({
//           error: "Failed to create user"
//         });
//       }
//       res.json(results);
//     }
//   );
// });

// app.put("/users/:id", function (req, res, next) {
//   const userId = req.params.id;
//   const {
//     username,
//     email,
//     password,
//     role
//   } = req.body;

//   // ตรวจสอบค่าว่าง
//   if (!username || !email || !password || !role || !userId) {
//     return res.status(400).json({
//       error: 'All fields and user ID are required'
//     });
//   }

//   connection.query(
//     "UPDATE `users` SET `username`=?, `password`=?, `email`=?, `role`=? WHERE `id`=?",
//     [username, password, email, role, userId],
//     function (err, results) {
//       if (err) {
//         console.error("Error updating user:", err);
//         return res.status(500).json({
//           error: 'Failed to update user'
//         });
//       }
//       res.json({
//         message: 'User updated successfully'
//       });
//     }
//   );
// });

// app.delete("/users/:id", (req, res, next) => {
//   const userId = req.params.id;

//   // ตรวจสอบว่ามีค่า id ที่ส่งมาหรือไม่
//   if (!userId) {
//     return res.status(400).json({
//       error: 'User ID is required'
//     });
//   }

//   connection.query(
//     "DELETE FROM `users` WHERE id = ?",
//     [userId],
//     function (err, results) {
//       if (err) {
//         console.error("Error deleting user:", err);
//         return res.status(500).json({
//           error: 'Failed to delete user'
//         });
//       }
//       res.json({
//         message: 'User deleted successfully'
//       });
//     }
//   );
// });



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const passportJWT = require("./middleware/passportJWT");
const errorHandler = require("./middleware/errorHandler");
const cronJob = require('./config/cronJob');
const limiter = rateLimit({
  windowMs: 15 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
cronJob();
app.set('trust proxy', 1);
app.use(limiter);
app.use(helmet());
app.use(logger("dev"));
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(errorHandler);

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const RoleRouter = require("./routes/rolecompany");
const chickenHouse = require("./routes/house");
const eggStorage = require("./routes/eggStorage");
const cronJobRoutes = require('./routes/cronJob');

app.use("/api/", indexRouter);
app.use("/api/info", usersRouter);
app.use("/api/chackrole", [passportJWT.isLogin], RoleRouter);
app.use("/api/house", [passportJWT.isLogin], chickenHouse);
app.use("/api/egg", [passportJWT.isLogin],eggStorage)
app.use('/api/cron', cronJobRoutes);
