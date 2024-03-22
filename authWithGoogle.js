const express = require("express");
const passport = require("passport");
const { GoogleUser } = require("./model/user");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const gRouter = express.Router();

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@cluster0.hodiq1h.mongodb.net/map_app?retryWrites=true&w=majority`
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      GoogleUser.findOne({ googleId: profile.id })
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            const newUser = new GoogleUser({
              googleId: profile.id,
              email: profile.email,
            });
            newUser
              .save()
              .then((user) => done(null, user))
              .catch((err) => done(err));
          }
        })
        .catch((err) => done(err));
    }
  )
);

gRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

gRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  function (req, res) {
    const token = jwt.sign(req.user, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(201).json({ token });
  }
);

module.exports = gRouter;
