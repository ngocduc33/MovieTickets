const Movies = require('../../models/movie');
const Showtimes = require("../../models/showtimes");
const Theater = require("../../models/theater");
const TheaterClusters = require("../../models/theater_clusters");
const Booking = require('../../models/booking');
const Ticket = require('../../models/ticket');
const User = require('../../models/user');
const db = require('../../config/database/db');

const QRCode = require('qrcode');

exports.getBookingSuccess = async (req, res, next) => {
   const { booking_id } = req.params;

    const booking = await Booking.findOne({   
        attributes: ['showtimes_id'],     
        where: {
            id: booking_id
        }
    });
    
    const showtime = await Showtimes.findOne({
        where: {
            id: booking.showtimes_id
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
            'kind'
        ],
        include: [{
            model: TheaterClusters,
            attributes: ['name']
        }],
        where: {
            id: showtime.theater_id,
        }
    });

    const seatList = await Ticket.findAll({
        attributes: ['seat_code'],
        where: {
            booking_id: booking_id
        }
    });

    // lấy danh sách tất cả phim để update viewed
    const movieList = await Movies.findAll({
        order: [["id", "ASC"]],
    });

    const dataQRCode = {
        userId: "1",
        bookingId: booking_id,
        showtimeId: showtime.id,
    }

    const momoQRCode = "https://test-payment.momo.vn/pay/store/MOMOKFA420210617-2106171443298352528f?a=10000&b=B001221&s=683aeb44452a938eb8e8550ebf888da90972c6d08097517956bfff7159d8358f";
     
    let stringDataQRCode = JSON.stringify(dataQRCode);

    let qrCode = await QRCode.toDataURL(stringDataQRCode);

    // thống kê lượt xem của các bộ phim
    const lstViewed = await Ticket.findAll({
        attributes: [
            [db.col("booking.showtime.movie_id"), "movieId"],
            [db.fn("COUNT", db.col("ticket.id")), "countView"],
        ],
        include: [
            {
                model: Booking,
                as: "booking",
                attributes: [],
                include: [
                    {
                        model: Showtimes,
                        as: "showtime",
                        attributes: [],
                    },
                ],
            },
        ],
        group: ["booking.showtime.movie_id"],
    });

    //cập nhật lại lượt xem cho các bộ phim
    lstViewed.map(async (item) => {
        try {
            let updateMovie = await Movies.update(
                { viewed: item.getDataValue("countView") },
                {
                    where: {
                        id: item.getDataValue("movieId"),
                    },
                }
            );
        } catch (error) {
            console.log(error);
        }
    });

    res.locals.qrCode = qrCode;
    res.locals.showtime = showtime;
    res.locals.theater = theater;
    res.locals.movieName = movie.name;
    res.locals.seatList = seatList;
    res.render("users/movie-booking-success");
};