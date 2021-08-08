const { DataTypes} = require("sequelize");
const db =require("../config/database/db");
const User=require("./user");
const Showtimes=require("./showtimes");

const Booking=db.define("booking",{
  id: {
    type: DataTypes.UUID,
    defaultValue:DataTypes.UUIDV4,
    primaryKey: true,
    allowNull:false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  showtimes_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booking_time: {
    type: DataTypes.DATEONLY,
    allowNull:false,
  },
  booking_price: {
    type: DataTypes.FLOAT,
  },
}, {timestamps: false, createdAt: false, updatedAt: false});

User.hasMany(Booking, {foreignKey: "user_id"});
Booking.belongsTo(User, {foreignKey: "user_id"});

Showtimes.hasMany(Booking, {foreignKey: "showtimes_id"});
Booking.belongsTo(Showtimes, {foreignKey: "showtimes_id"});

module.exports = Booking;
