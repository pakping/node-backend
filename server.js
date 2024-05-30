// Import libraries
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
require("dotenv").config();
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
const cronJob = require("./config/cronJob");
const limiter = rateLimit({
  windowMs: 15 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

cronJob();
app.set("trust proxy", 1);
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
const cronJobRoutes = require("./routes/cronJob");
// const EggStockRoutes = require('./routes/eggStock');
const SellEggRoutes = require("./routes/sellEgg");

app.use("/api/", indexRouter);
app.use("/api/info", usersRouter);
app.use("/api/chackrole", [passportJWT.isLogin], RoleRouter);
app.use("/api/house", [passportJWT.isLogin], chickenHouse);
app.use("/api/egg", [passportJWT.isLogin], eggStorage);
app.use("/api/sell-egg", [passportJWT.isLogin], SellEggRoutes);
app.use("/api/cron", [passportJWT.isLogin], cronJobRoutes);

// New route for checking API status
app.get("/api/status", (req, res) => {
  // Simulate an error status for demonstration purposes
  const error = false;
  if (error) {
    res.status(500).json({ status: "Error", message: "Something went wrong!" });
  } else {
    res.status(200).json({ status: "Operational", message: "All systems are operational." });
  }
});