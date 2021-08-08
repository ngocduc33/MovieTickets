const { Op } = require("sequelize");
const db = require("../../config/database/db");
const asyncHandler = require("express-async-handler");
const moment = require("moment");
const Theater_clusters = require("../../models/theater_clusters");
const Movies = require("../../models/movie");
const Ticket = require("../../models/ticket");
const Booking = require("../../models/booking");
const Showtimes = require("../../models/showtimes");
const Theater = require("../../models/theater");

exports.getIndex = asyncHandler(async (req, res) => {
  //get list theater_clusters

  if(req.session.user_role == true)
  {
    res.locals.lstTheaterCluster = await Theater_clusters.findAll({
      attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
    });
    
    //get list movies
    res.locals.lstMovies = await Movies.findAll({
      attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
    });
    res.render("admin/index");
  }
  else
  {
    res.redirect("/user");
  }
});

//post statistics theater cluster
exports.postStatisticCluster = asyncHandler(async (req, res) => {
  const {date_start, date_end, select_cluster} = req.body;
  
  if (select_cluster !== "all") {
    //get list theater by theater cluster id
    const getListTheater = await Theater.findAll({
      attributes: ["id", "name"],
      where: {
        theater_cluster_id: select_cluster,
      },
    });

    const listTheater = [];
    getListTheater.forEach((item) => listTheater.push(item.id));

    const listBooking = await Booking.findAll({
      attributes: [
        [db.fn("COUNT", db.col("booking.id")), "AmountTicket"],
        [db.fn("SUM", db.col("booking_price")), "TotalPrice"],
      ],
      include: [
        {
          model: Showtimes,
          where: {
            theater_id: listTheater,
          },
          attributes: [],
        },
      ],
      where: {
        booking_time: {
          [Op.between]: [date_start, date_end],
        },
      },
      group: ["booking.user_id"],
      raw: true,
    });

    const lstResult = {};

    let ticket = 0;
    let price = 0;

    for (var i = 0; i < listBooking.length; i++) {
      ticket += parseInt(listBooking[i].AmountTicket);
      price += parseFloat(listBooking[i].TotalPrice);
    }

    lstResult.ticketTotal = String(ticket).replace(/(.)(?=(\d{3})+$)/g, "$1,");
    lstResult.priceTotal = String(price).replace(/(.)(?=(\d{3})+$)/g, "$1,");

    return res.status(200).json(lstResult);
  }
  else
  {
    const listBooking = await Booking.findAll({
      attributes: [
        [db.fn("COUNT", db.col("booking.id")), "AmountTicket"],
        [db.fn("SUM", db.col("booking_price")), "TotalPrice"],
      ],
      include: [
        {
          model: Showtimes,
          as: 'showtime',
          required: true,
          attributes: [],
          include: [
            {
              model: Theater,
              as: 'theater',
              required: true,
              attributes: [],
              include: [
                {
                  model: Theater_clusters,
                  as: 'theater_cluster',
                  required: true,
                  attributes: ['name']
                }
              ]
            }
          ]
        },
      ],
      where: {
        booking_time: {
          [Op.between]: [date_start, date_end],
        },
      },
      group: ["showtime.theater.theater_cluster.name", "showtime.theater.theater_cluster.id"],
      raw: true,
    });

    let lstResult = {};

    let ticket = 0;
    let price = 0;

    for (var i = 0; i < listBooking.length; i++) {
      ticket += parseInt(listBooking[i].AmountTicket);
      price += parseFloat(listBooking[i].TotalPrice);
    }

    ticketTotal = String(ticket).replace(/(.)(?=(\d{3})+$)/g, "$1,");
    priceTotal = String(price).replace(/(.)(?=(\d{3})+$)/g, "$1,");

    //get list labels
    let listLabels=[];
    listBooking.forEach(item => listLabels.push(item['showtime.theater.theater_cluster.name']));

    //get list amount ticket
    let listTicket = [];
    listBooking.forEach(item => listTicket.push(item.AmountTicket));

    //get list total price
    let listPrice = [];
    listBooking.forEach(item => listPrice.push(item.TotalPrice)); 
    
    lstResult = {
      listLabels,
      listTicket,
      listPrice,
      ticketTotal,
      priceTotal,
    }

    return res.status(200).json(lstResult);
  }
});

//post statistic movies
exports.postStatisticMovies = asyncHandler(async (req, res) => {
  const { date_start, date_end, select_movies } = req.body;

  if (select_movies !== "all") {
    //get list showtime id by movies selected
    const getListShowtimes = await Showtimes.findAll({
      attributes: ["id"],
      where: {
        movie_id: select_movies,
      },
    });

    const listShowtimes = [];
    getListShowtimes.forEach((item) => listShowtimes.push(item.id));

    const listBooking = await Booking.findAll({
      attributes: [
        [db.fn("COUNT", db.col("booking.id")), "AmountTicket"],
        [db.fn("SUM", db.col("booking_price")), "TotalPrice"],
      ],
      where: {
        booking_time: {
          [Op.between]: [date_start, date_end],
        },
        showtimes_id: {
          [Op.in]: listShowtimes,
        },
      },
      group: ["booking.user_id"],
      raw: true,
    });

    const lstResult = {};

    let ticket = 0;
    let price = 0;

    for (var i = 0; i < listBooking.length; i++) {
      ticket += parseInt(listBooking[i].AmountTicket);
      price += parseFloat(listBooking[i].TotalPrice);
    }

    lstResult.ticketTotal = String(ticket).replace(/(.)(?=(\d{3})+$)/g, "$1,");
    lstResult.priceTotal = String(price).replace(/(.)(?=(\d{3})+$)/g, "$1,");

    return res.status(200).json(lstResult);
  }
  else
  {
    const listBooking = await Booking.findAll({
      attributes: [
        [db.fn("COUNT", db.col("booking.id")), "AmountTicket"],
        [db.fn("SUM", db.col("booking_price")), "TotalPrice"],
      ],
      include: [
        {
          model: Showtimes,
          as: 'showtime',
          required: true,
          attributes: [], 
          include: [
            {
              model: Movies,
              as: 'movie',
              required: true,
              attributes: ['name']
            }
          ]
        }
      ],
      where: {
        booking_time: {
          [Op.between]: [date_start, date_end],
        },
      },
      group: ["showtime.movie.name", "showtime.movie.id"],
      raw: true,
    });

    let lstResult = {};

    let ticket = 0;
    let price = 0;

    for (var i = 0; i < listBooking.length; i++) {
      ticket += parseInt(listBooking[i].AmountTicket);
      price += parseFloat(listBooking[i].TotalPrice);
    }

    ticketTotal = String(ticket).replace(/(.)(?=(\d{3})+$)/g, "$1,");
    priceTotal = String(price).replace(/(.)(?=(\d{3})+$)/g, "$1,");

    //get list labels
    let listLabels=[];
    listBooking.forEach(item => listLabels.push(item['showtime.movie.name']));

    //get list amount ticket
    let listTicket = [];
    listBooking.forEach(item => listTicket.push(item.AmountTicket));

    //get list total price
    let listPrice = [];
    listBooking.forEach(item => listPrice.push(item.TotalPrice));

    lstResult = {
      listLabels,
      listTicket,
      listPrice,
      ticketTotal,
      priceTotal,
    }
    
    return res.status(200).json(lstResult);
  }
});
