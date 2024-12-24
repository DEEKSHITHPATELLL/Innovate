const mongoose = require('mongoose');
const {peopleDB}=require("../config/db")
const PeopleSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });
const People = peopleDB.model('Peoples',PeopleSchema );

module.exports = People;
