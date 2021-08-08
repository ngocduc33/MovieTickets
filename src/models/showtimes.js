const { DataTypes } = require("sequelize");
const db = require("../config/database/db");
const Movies = require('./movie');
const Theater = require('./theater');

const Showtimes = db.define("showtimes", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  theater_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  start_time: {
    type: DataTypes.TIME,
  },
  end_time: {
    type: DataTypes.TIME,
  },
  price: {
    type: DataTypes.DOUBLE,
  },
}, {timestamps: false, createdAt: false, updatedAt: false});

//foreign key between table showtimes and movies
Movies.hasMany(Showtimes, {
  foreignKey: "movie_id",
});
Showtimes.belongsTo(Movies, {foreignKey: 'movie_id'});

//foreign key between table shotimes and theater
Theater.hasMany(Showtimes, {
  foreignKey: 'theater_id',
});
Showtimes.belongsTo(Theater, {foreignKey: 'theater_id'});

module.exports = Showtimes;