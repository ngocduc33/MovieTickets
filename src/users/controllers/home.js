const db = require('../../config/database/db');
const asyncHandler = require("express-async-handler");
const Movies = require('../../models/movie');
const Showtimes = require("../../models/showtimes");
const Theater = require("../../models/theater");
const Theater_clusters = require("../../models/theater_clusters");
const Movies_schedule = require('../../models/movies_schedule')

exports.getMovies = asyncHandler(async (req, res) => {
    //get message from query
    const message = req.query.message;
    console.log("message: " + message);

    //set value for select option 
    //list movie
    res.locals.listMovies = await Movies.findAll({
      attributes: [
          [db.fn('DISTINCT', db.col('name')), 'name'],'id']
    });

    //list theater cluster
    res.locals.listTheaterClusters = await Theater_clusters.findAll({
      attributes: [
          [db.fn('DISTINCT', db.col('name')), 'name'],'id']
    });

    //list showtime
    res.locals.listDate = await Movies_schedule.findAll({
      attributes: [
          [db.fn('DISTINCT', db.col('schedule_date')), 'schedule_date']
      ],
      order: [["schedule_date", "ASC"]],
    });
    
    //top movie just release
    const justRelease = await Movies.findAll({
      order: [['releaseDate', 'DESC']],
      limit: 6,
    });

    //top most watched movie
    const mostViewed = await Movies.findAll({
      order: [["viewed", "DESC"]],
      limit: 6,
    });

    //top favoried movie
    const mostLiked = await Movies.findAll({
      order: [["liked", "DESC"]],
      limit: 6,
    });

    justRelease.forEach( movie => {
      if(movie.poster)
      {
        movie.poster = Buffer.from(movie.poster, 'binary').toString('base64');
      }
    });

    mostViewed.forEach( movie => {
      if(movie.poster)
      {
        movie.poster = Buffer.from(movie.poster, 'binary').toString('base64');
      }
    });

    mostLiked.forEach( movie => {
      if(movie.poster)
      {
        movie.poster = Buffer.from(movie.poster, 'binary').toString('base64');
      }
    });

    res.render("users/home", { justRelease, mostViewed, mostLiked, message });
});