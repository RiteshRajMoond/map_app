const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../model/user");
const { equals } = require("validator");

mongoose.connect(
  "mongodb+srv://ritesh:qwerty1@cluster0.hodiq1h.mongodb.net/map_app?retryWrites=true&w=majority"
);

exports.signUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 6)
    .then((hashedPw) => {
      const user = new User({
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

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email: email })
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
      const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      },
        "SecretSecretSecretKeysssssssssssssssss",
        {
          expiresIn: "1h"
        }
      );
      res.status(200).json({token: token, message: "loggedIn"});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json("In catch block of login");
    })
};
