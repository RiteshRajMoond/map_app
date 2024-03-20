const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "must be 8 characters"],
    validate: {
      validator: function (v) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v);
      },
      message: "Password must contain at least one number, one lowercase and one uppercase letter"
    },
  },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
