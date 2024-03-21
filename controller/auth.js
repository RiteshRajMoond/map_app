const bcrypt = require("bcrypt");
const passport = require("passport");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const { LocalUser, GoogleUser } = require("../model/user");
const { equals } = require("validator");

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@cluster0.hodiq1h.mongodb.net/map_app?retryWrites=true&w=majority`
);

//Local User
// Working Well after changing schema to introduce sign in with google
exports.signUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 6)
    .then((hashedPw) => {
      const user = new LocalUser({
        email: email,
        password: hashedPw,
      });
      return user.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({ message: "New User Created!", userId: result._id });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Cannot create User" });
    });
};

//Local User
// Working Well after changing schema to introduce sign in with google
exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  LocalUser.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json("User not found");
      }
      loadedUser = user;
      return bcrypt.compare(password, loadedUser.password);
    })
    .then((equals) => {
      if (!equals) {
        return res.status(401).json("Wrong Password");
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ token: token, message: "loggedIn" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json("In catch block of login");
    });
};

//Google user
exports.googleStrategy = (req, res, next) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http:/8080/auth/google/callback",
        passReqToCallback: true,
      },

      function (request, accessToken, refreshToken, profile, done) {
        GoogleUser.findOne(
          { email: profile.emails[0].value },
          function (err, user) {
            if (err) {
              console.log(done(err));
              return res.status(404).json("In googleStrategy");
            }

            //email already exists
            if (user) {
              console.log(done(null, err));
              return res.status(200).json("user exists already");
            } else {
              const newUser = new GoogleUser({
                googleId: profile.id,
                email: profile.emails[0].value,
              });

              newUser.save(function (err) {
                if (err) {
                  console.log(done(err));
                  return res.status(404).json("in googleStratergy");
                } else {
                  console.log(done(null, err));
                  return res.status(200);
                }
              });
            }
          }
        );
      }
    )
  );
};