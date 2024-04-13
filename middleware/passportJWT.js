const config = require("../config/jwt");
const db = require("../config/index");
const passport = require("passport");
// const User = require("../models/user");


const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

// console.log('🔐:',JwtStrategy);
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.jwtSecret;
// console.log("config:",opts.secretOrKey );
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try { 
      // ค้นหาผู้ใช้จาก ID ที่มีอยู่ใน JWT payload
      const [rows, fields] = await db.query('SELECT * FROM users WHERE id = ?', [jwt_payload.id]);
      const user = rows[0]; // ถ้าไม่พบผู้ใช้จะได้เป็น undefined

      if (!user) {
        return done(new Error("ไม่พบผู้ใช้ในระบบ"), null);
      }

      return done(null, user);
    } 
    catch (error) {
      done(error);
    }
  }
)
);

module.exports.isLogin = passport.authenticate("jwt", { session: false });
