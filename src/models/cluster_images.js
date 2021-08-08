const { DataTypes } = require("sequelize");
const db = require("../config/database/db");
const Theater_clusters = require("./theater_clusters");

const Cluster_images = db.define("cluster_images", {
  cluster_id: {
    type: DataTypes.INTEGER,
  },
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  image: {
    type: DataTypes.BLOB,
    allowNull: true,
  }
}, {timestamps: false, createdAt: false, updatedAt: false});

Theater_clusters.hasMany(Cluster_images, { foreignKey: "cluster_id" });
Cluster_images.belongsTo(Theater_clusters, {foreignKey: 'cluster_id'});

module.exports = Cluster_images;