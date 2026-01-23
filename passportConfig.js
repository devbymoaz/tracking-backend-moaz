const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { db } = require("./db/index");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails[0].value;

      try {
        const [rows] = await db.execute(
          "SELECT * FROM users WHERE google_id = ?",
          [id]
        );

        if (rows.length > 0) {
          return done(null, rows[0]);
        } else {
          // Insert new user into the database
          const [result] = await db.execute(
            "INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)",
            [id, displayName, email]
          );

          return done(null, { id: result.insertId, displayName, email });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
