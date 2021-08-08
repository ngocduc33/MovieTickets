const { Op } = require("sequelize");
const moment = require('moment');
const db = require('../../config/database/db');
const asyncHandler = require("express-async-handler");
const Movies = require('../../models/movie');
const Showtimes = require("../../models/showtimes");
const Theater = require("../../models/theater");
const Theater_clusters = require("../../models/theater_clusters");
const Movies_schedule = require("../../models/movies_schedule");
const Booking = require('../../models/booking');
const Ticket = require('../../models/ticket');
const User = require('../../models/user');

exports.getShowTimes = asyncHandler(async (req, res) => {
    //lấy danh sách các phim
    res.locals.listMovies = await Movies.findAll({
        attributes: [
            [db.fn('DISTINCT', db.col('name')), 'name'],
            'id'
        ]
    });

    res.render("users/movie-ticket-plan");
});

//lọc các cụm rạp theo phim
exports.filterCluster = asyncHandler(async (req, res) => {
    const lstResult = await Movies_schedule.findAll({
        attributes: [
        [db.literal('DISTINCT("theater_cluster"."name")'), 'theater_cluster_name'],
        'movie_id',
        'theater_cluster_id'
        ],
        include: {
            model: Theater_clusters,
            as: 'theater_cluster',
            attributes: ['name']
        },
        where: {
            movie_id: req.body.movie_id
        },
        order: [
            ['theater_cluster_id', 'ASC']
        ]
    });
    let lstSendAjax = []
    lstResult.forEach(item => 
        lstSendAjax.push({cluster_id: item.theater_cluster_id, cluster_name: item.theater_cluster.name}));
    return res.status(200).json(lstSendAjax);
});

//lọc các ngày chiếu phim theo phim và cụm rạp
exports.filterDate = asyncHandler(async (req, res) => {
    console.log('request: ' + req);
    const lstResult = await Movies_schedule.findAll({
        attributes: [
            [db.fn('DISTINCT', db.col('schedule_date')), 'schedule_date'],
        ],
        where: {
            movie_id: req.body.movie,
            theater_cluster_id: req.body.cluster
        },
        order: [
            ['schedule_date', 'ASC']
        ]
    });
    let lstSendAjax = []
    lstResult.forEach(item => lstSendAjax.push({schedule_date_frm: moment(item.schedule_date).format( 'DD-MM-YYYY'), schedule_date: item.schedule_date}));
    return res.status(200).json(lstSendAjax);
});

//lấy dữ liệu từ request và xử lý
exports.postShowTimes = asyncHandler(async (req, res) => {
    const { select_movie, select_theater_cluster, select_date } = req.body;

    //kiểm tra nếu không tồn tại dữ liệu
    if(!select_movie || !select_theater_cluster || !select_date){
        res.locals.listShowTimes = null;
        req.flash('info', 'Hãy chọn đầy đủ các thông tin');
        res.redirect('/user/');
    }
    //lấy danh sách các rạp theo cụm rạp
    const getListTheater = await Theater.findAll({
        where: {
            theater_cluster_id: select_theater_cluster
        },
        attributes: ['id', 'name']
    });

    //bỏ danh sách các rạp vào list
    let listTheater = [];
    getListTheater.forEach(item => {
        listTheater.push(item.id);
    });

    const showtimesList = await Showtimes.findAll({
        attributes: [
            'id',
            'movie_id',
            'theater_id',
            'date',
            'start_time', 
            'end_time',
        ],
        include: [
            {
                model: Movies,
                attributes: ['name', 'id']
            },
            {
                model: Theater,
                include: [
                    {
                        model: Theater_clusters,
                        attributes: ['id', 'name']
                    }
                ]
            }
        ],
        where: {
            [Op.and]: [
                { movie_id: select_movie },
                { theater_id: listTheater},
                { date: select_date }
            ]
        },
        order: [
            ['start_time', 'asc'],
            ['end_time', 'asc']
         ]
    });

    if(showtimesList.length !==0)
    {
        req.session.listShowtimes = showtimesList;
        res.redirect('/user/movie-ticket-plan');
    }
    else {
        res.locals.listShowTimes = null;
        req.flash('info', 'Phim bạn chọn tạm thời chưa có suất chiếu. Xin vui lòng chọn phim khác')
        res.redirect('/user/');
    }
});

// ajax search showtimes
exports.ajaxSearchShowtimes = asyncHandler(async (req, res) => {
    res.locals.listShowTimes = null;
    
    const select_movie = req.body.select_movie;
    const select_cluster = req.body.select_cluster;
    const select_date = req.body.select_date;

    console.log('movie_selected: ' + select_movie);
    console.log('cluster_selected: ' + select_cluster);
    console.log('date_selected: ' + select_date);

    //kiểm tra nếu không tồn tại dữ liệu
    if(!select_movie || !select_cluster || !select_date){
        req.flash('info', '')
        res.redirect('/user/movie-ticket-plan');
    }

    //lấy danh sách các rạp theo cụm rạp
    const getListTheater = await Theater.findAll({
        where: {
            theater_cluster_id: select_cluster
        },
        attributes: ['id', 'name']
    });

    //bỏ danh sách các rạp vào list
    let listTheater = [];
    getListTheater.forEach(item => {
        listTheater.push(item.id);
    });

    const showtimesList = await Showtimes.findAll({
        attributes: [
            'id',
            'movie_id',
            'theater_id',
            'date',
            'start_time', 
            'end_time',
        ],
        include: [
            {
                model: Movies,
                attributes: ['name', 'id']
            },
            {
                model: Theater,
                include: [
                    {
                        model: Theater_clusters,
                        attributes: ['id', 'name']
                    }
                ]
            }
        ],
        where: {
            [Op.and]: [
                { movie_id: select_movie },
                { theater_id: listTheater},
                { date: select_date }
            ]
        },
        order: [
            ['start_time', 'asc'],
            ['end_time', 'asc']
         ]
    });

    showtimesList.forEach((item) => {
        item.start_time = moment(item.start_time, "HH:mm:ss").format("HH:mm"),
        item.end_time = moment(item.end_time, "HH:mm:ss").format("HH:mm")
    });

    return res.status(200).json(showtimesList);
});