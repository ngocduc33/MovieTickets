const { DataTypes} = require("sequelize");
const db =require("../config/database/db");

const Movies = db.define("movies", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
  },
  poster: {
    type: DataTypes.BLOB,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
  },
  trailer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  viewed: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  liked: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
}, {timestamps: false, createdAt: false, updatedAt: false});

module.exports = Movies;
