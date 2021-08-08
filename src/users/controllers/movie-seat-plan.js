const Movies = require('../../models/movie');
const Showtimes = require("../../models/showtimes");
const Theater = require("../../models/theater");
const TheaterClusters = require("../../models/theater_clusters");
const Booking = require('../../models/booking');
const Ticket = require('../../models/ticket');
const User = require('../../models/user');

const { Op } = require("sequelize");

let showtime = null
let bookedSeatList = null;

exports.getSeat = async (req, res, next) => {
    const { showtimeId }= req.params;

    showtime = await Showtimes.findOne({
        where: {
            id: showtimeId
        }
    }); 

    const movie = await Movies.findOne({
        attributes: ['name'],
        where: {
            id: showtime.movie_id
        }
    });

    const theater = await Theater.findOne({
        attributes: [
            'name', 
            'kind',
            'horizontial_size', 
            'vertical_size',
        ],
        include: [{
            model: TheaterClusters,
            attributes: ['name']
        }],
        where: {
            id: showtime.theater_id,
        }
    });

    const booking = await Booking.findAll({
        attributes: ['id'],
        where: {
            showtimes_id: showtimeId
        }
    });

    const bookingList = [];

    booking.forEach(e => {
        bookingList.push(e.id)
    });

    bookedSeatList = await Ticket.findAll({
        attributes: ['seat_code', 'horizontal_address', 'vertical_address'],
        where: {
            booking_id: {
                [Op.in]: bookingList,
            }        
        }
    });

    res.locals.movie = movie;
    res.locals.theater = theater;
    res.locals.showtime = showtime;
    res.locals.bookedSeatList = bookedSeatList;
    res.render("users/movie-seat-plan");
};

exports.postSeat = async (req, res, next) => {
    const { showtimeId } = req.params;

    let currentSeatList = JSON.parse(req.body.currentSeatList);
    
    bookedSeatList.forEach(e => {
        const index = currentSeatList.indexOf(e.ticket_seat_code);
        if (index > -1) {
            currentSeatList.splice(index, 1);
        }
    });

    req.session.showtimeId = showtimeId;  
    req.session.currentSeatList = currentSeatList; 
    req.session.prevUrl = req.originalUrl;
    res.redirect('/user/movie-checkout');
};