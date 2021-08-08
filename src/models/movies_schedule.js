const { DataTypes } = require("sequelize");
const db = require("../config/database/db");
const Movies = require("./movie");
const Theater_clusters = require("./theater_clusters");

const Movies_schedule = db.define("movies_schedule", {
  movie_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  theater_cluster_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  schedule_date: {
    type: DataTypes.DATEONLY,
    primaryKey: true,
  },
}, {timestamps: false, createdAt: false, updatedAt: false});

//foreign key movie_id
Movies_schedule.belongsTo(Movies, { foreignKey: "movie_id"});

//foreign key theater_cluster_id
Movies_schedule.belongsTo(Theater_clusters, { foreignKey: 'theater_cluster_id'});

module.exports = Movies_schedule;
