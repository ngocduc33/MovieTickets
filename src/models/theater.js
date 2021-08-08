const { DataTypes } = require("sequelize");
const db = require("../config/database/db");
const Theater_clusters = require("./theater_clusters");

const Theater = db.define("theater", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  theater_cluster_id: {
    type: DataTypes.INTEGER,
  },
  name: {
    type: DataTypes.STRING,
  },
  kind: {
    type: DataTypes.STRING,
  },
  horizontial_size: {
    type: DataTypes.INTEGER,
  },
  vertical_size: {
    type: DataTypes.INTEGER,
  },
}, {timestamps: false, createdAt: false, updatedAt: false});

Theater_clusters.hasMany(Theater, { foreignKey: "theater_cluster_id" });
Theater.belongsTo(Theater_clusters, {foreignKey: 'theater_cluster_id'});

module.exports = Theater;