const Movies = require('../../models/movie');
const Showtimes = require("../../models/showtimes");
const Theater = require("../../models/theater");
const TheaterClusters = require("../../models/theater_clusters");
const Booking = require('../../models/booking');
const Ticket = require('../../models/ticket');
const User = require('../../models/user');
const db = require('../../config/database/db');
const moment = require('moment');

const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "6477a466",
  apiSecret: "bJdg9kUzPf6LKtKy"
})

let currentSeatList = null;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL || 'ltw2nnd@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'erzfrkcjmupomcnt'
    }
});

let currentShowtime = null;

exports.getCheckout = async (req, res, next) => {

    const { showtimeId, currentUser } = req.session;

    currentSeatList = req.session.currentSeatList;

    if(!currentUser)
    {
        const string = encodeURIComponent('Vui lòng đăng nhập để thực hiện thanh toán');
        res.redirect('/user/sign-in/?valid=' + string);  
    }
    if(!showtimeId || !currentSeatList) {
        res.redirect("/user")
    }
    else
    {
        const showtime = await Showtimes.findOne({        
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
        const totalPrice = showtime.price * currentSeatList.length;

        // đếm số ghế đã đặt
        const countSeat = currentSeatList.length;
    
        currentShowtime = {
            showtime: showtime,
            theater: theater,
            movieName: movie.name,
            totalPrice: totalPrice,
            countSeat,
        }
    
        res.locals.currentShowtime = currentShowtime;
        res.locals.currentSeatList = currentSeatList;
        res.render("users/movie-checkout");
    }
};

exports.postCheckout = async (req, res, next) => {
    const user = req.session.currentUser;
    
    try {
        const result = await db.transaction(async (t) => {
            const booking = await Booking.create({
                user_id: user.user_id,
                showtimes_id: currentShowtime.showtime.id,
                booking_time: new Date(),
                booking_price: currentShowtime.totalPrice
            }).then(async function (dbBooking) {
                const ticketList = [];

                currentSeatList.forEach(e => {
                    const ticket = {
                        booking_id: dbBooking.id,
                        seat_code: e,
                        horizontal_address: e.slice(1),
                        vertical_address: e[0],
                        price: currentShowtime.showtime.price
                    };
    
                    ticketList.push(ticket);
                });
    
                Ticket.bulkCreate(ticketList, {
                    returning: true
                }, { transaction: t }).then((result) => {
                    console.log(result);
                });

                return dbBooking;
            }, { transaction: t });

            

                delete req.session.showtimeId;
                delete req.session.currentSeatList;

                const dataQRCode = {
                    userId: user.user_id,
                    bookingId: booking.id,
                    showtimeId: currentShowtime.showtime.id,
                }
                const stringDataQRCode = JSON.stringify(dataQRCode);
                const qrCode = await QRCode.toDataURL(stringDataQRCode);

                await transporter.sendMail({
                    from: process.env.EMAIL || 'ltw2nnd@gmail.com',
                    to: `${user.user_email}`,
                    subject: "Đặt vé thành công",
                    textEncoding:"base64",
                    html: `<h1> Xin chào ${user.user_name} </h1>
                        <table align="left">
                            <tbody>
                                <tr>
                                    <td>Mã vé:</td>
                                    <th align="left">${booking.id}</th>
                                </tr>
                                <tr>
                                    <td>Phim:</td>
                                    <th align="left">${currentShowtime.movieName}</th>
                                </tr>
                                <tr>
                                    <td>Cụm rạp:</td>
                                    <th align="left">${currentShowtime.theater.theater_cluster.name}</th>
                                </tr>
                                <tr>
                                    <td>Phòng chiếu:</td>
                                    <th align="left">${currentShowtime.theater.name}</th>
                                </tr>
                                <tr>
                                    <td>Thời gian:</td>
                                    <th align="left">${moment(currentShowtime.showtime.date).format('DD/MM/YYYY')}, 
                                    ${currentShowtime.showtime.start_time.substr(0, 5)} ~ ${currentShowtime.showtime.end_time.substr(0, 5)}</th>
                                </tr>
                                <tr>
                                    <td>Ghế:</td>
                                    <th align="left"><p>${currentSeatList.join(', ')}</p></th>
                                </tr>
                                <tr>
                                    <td>Phương thức thanh toán (Payment method):</td>
                                    <th align="left">Thẻ nội địa (Domestic Card)</th>
                                </tr>
                                <tr>
                                    <td>Thời gian thanh toán (Payment Time):</td>
                                    <th align="left">27/03/2021 21:31:20</th>
                                </tr>
                                <tr>
                                    <td>Tổng tiền (Total):</td>
                                    <th align="left"><u></u>${currentShowtime.totalPrice}<u></u> VND</th>
                                </tr>
                                <tr>
                                    <td>Mã QR:</td>
                                    <td><img src="cid:qrCode" atl="img"></td>
                                </tr>
                            </tbody>
            
                        </table>
                    `,
                    attachments: [{
                        path: qrCode,
                        cid: 'qrCode' //same cid value as in the html img src
                    }]
                }).then(console.log).catch(console.error);

                const from = "Sky cinema";
                const to = "84356151865";
                //const to = user.user_phone;

                const text = 'Đặt vé thành công, Mã vé: '+ booking.id 
                    + ', Phim: '+currentShowtime.movieName+', Thời gian: '
                    + moment(currentShowtime.showtime.date).format('DD/MM/YYYY') + ', ' 
                    + currentShowtime.showtime.start_time.substr(0, 5) +'~'+ currentShowtime.showtime.end_time.substr(0, 5)
                    + 'Ghế: ' + currentSeatList.join(', ');
                //const text = 'Đặt vé thành công';

                vonage.message.sendSms(from, to, text, {type: 'unicode'}, (err, responseData) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if(responseData.messages[0]['status'] === "0") {
                            console.log("Message sent successfully.");
                        } else {
                            console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                        }
                    }
                });

                res.redirect(`/user/booking/success/${booking.id}`);
        });
    } catch(e) {
        console.log(e);
    }
};