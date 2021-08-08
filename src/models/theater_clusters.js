const { DataTypes } = require("sequelize");
const db = require("../config/database/db");

const Theater_clusters = db.define("theater_clusters", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  picture: {
    type: DataTypes.BLOB,
    allowNull: true,
  }
}, {timestamps: false, createdAt: false, updatedAt: false});

module.exports = Theater_clusters;
