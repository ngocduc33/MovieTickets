const asyncHandler = require("express-async-handler");
const Booking = require("../../models/booking");
const Movies = require("../../models/movie");
const Showtimes = require("../../models/showtimes");
const Theater = require("../../models/theater");
const Theater_clusters = require("../../models/theater_clusters");
const Ticket = require("../../models/ticket");
const db = require("../../config/database/db");
const moment = require('moment');

exports.getListTicket = asyncHandler( async (req, res) => {
    const { currentUser } = req.session;
    if(!currentUser)
    {
        req.session.prevUrl = '/user/ticket-list';
        const string = encodeURIComponent('Vui lòng đăng nhập để xem lịch sử đặt vé');
        res.redirect('/user/sign-in/?valid=' + string);
    }
    else
    {
        // get booking id by user id
        const booking = await Booking.findAll({
            attributes: ['id'],
            where: {
                user_id: currentUser.user_id
            },
            order: [["booking_time", "ASC"]]
        });

        // list để lưu booking id
        let listBookingId = [];

        // list để lưu danh sách vé
        let ticketList = [];

        // bỏ booking id vào list
        if(booking !== 0)
        {
            booking.forEach(e => listBookingId.push(e.id));
        }
        
        // count item in list
        const numBooking = listBookingId.length;
        
        // duyệt qua từng booking id trong list

        let numTicket = 0;

        if(numBooking !== 0)
        {
            listBookingId.map( async (item) => {

                let ticketItem = {};
                
                // lấy mã ghế
                const ticket = await Ticket.findAll({
                    attributes: ['seat_code'],
                    where: {
                        booking_id: item
                    }
                });
    
                // list lưu các mã ghế
                let listSeatCode = [];
    
                // bỏ các mã ghế vào list
                ticket.forEach(e => listSeatCode.push(e.seat_code));
    
                // lấy các showtime id theo booking id
                const showtimeId = await Booking.findOne({
                    attributes: ['showtimes_id'],
                    where: {
                        id: item
                    }
                });
    
                // lấy các thông tin suất chiếu
                const showtime = await Showtimes.findOne({
                    attributes: ['date', 'start_time', 'end_time', 'movie_id', 'theater_id'],
                    where: {
                        id: showtimeId.showtimes_id
                    }
                });
    
                // lấy tên phim
                const movie = await Movies.findOne({
                    attributes: ['id','name'],
                    where: {
                        id: showtime.movie_id
                    }
                });
    
                // lấy tên rạp
                const theater = await Theater.findOne({
                    attributes: ['theater_cluster_id', 'name'],
                    where: {
                        id: showtime.theater_id
                    }
                });
    
                // lấy tên cụm rạp
                const cluster = await Theater_clusters.findOne({
                    attributes: ['name', 'id'], 
                    where: {
                        id: theater.theater_cluster_id
                    }
                })
                
                // bỏ vào object
                ticketItem.userId = currentUser.user_id;
                ticketItem.listSeatCode = listSeatCode;
                ticketItem.date = showtime.date;
                ticketItem.start_time = showtime.start_time;
                ticketItem.end_time = showtime.end_time;
                ticketItem.movie = movie;
                ticketItem.theaterName = theater.name;
                ticketItem.clusterName = cluster.name;
                ticketItem.clusterId = cluster.id;

                // kiểm tra vé còn hiệu lực hay không
                if(showtime.date < moment(moment()).format("YYYY-MM-DD"))
                {
                    ticketItem.disableTicket = true;
                }
                else
                {
                    ticketItem.disableTicket = false;
                }

                //push in list
                ticketList.push(ticketItem);
                
                numTicket++;
    
                if(numTicket === numBooking)
                {
                    res.locals.ticketList = ticketList;
                    res.render('users/ticket-list');
                }
            });
        }
        else
        {
            res.locals.ticketList = ticketList;
            res.render('users/ticket-list');
        }     
    }
});