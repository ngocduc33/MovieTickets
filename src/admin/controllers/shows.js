const db = require("../../config/database/db");
const { Op } = require("sequelize");
const moment = require("moment");
const Movie = require("../../models/movie");
const Theater = require("../../models/theater");
const Showtimes = require("../../models/showtimes");
const Theater_clusters = require("../../models/theater_clusters");
const Movies_schedule = require("../../models/movies_schedule");
const Movies = require("../../models/movie");

//INDEX
exports.getIndex = async (req, res, next) => {
    if (req.session.user_role == true) {
        res.locals.showsList = await Showtimes.findAll({
            include: [
                {
                    model: Theater,
                    attributes: ["name"],
                    include: [
                        {
                            model: Theater_clusters,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Movies,
                    attributes: ["name"]
                }
            ]
        });
        res.render("admin/shows/index");
    } else {
        res.redirect("/user");
    }
};

// GET ADD
exports.getAdd = async (req, res, next) => {
    if (req.session.user_role == true) {
        //get list movies
        res.locals.lstMovies = await Movie.findAll({
            attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
        });

        //get list theater cluster
        res.locals.lstCluster = await Theater_clusters.findAll({
            attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
        });
        res.render("admin/shows/add");
    } else {
        res.redirect("/user");
    }
};

//POST ADD
exports.postAdd = async (req, res, next) => {
    try 
    {
        res.locals.lstMovies = await Movie.findAll({
            attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
        });

        res.locals.lstCluster = await Theater_clusters.findAll({
            attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
        });

        const { start, end, date, price, movieID, clusterID, theaterID } = req.body;

        // Lấy ngày ra mắt phim
        const movie = await Movie.findOne({
          attributes: ['releaseDate'],
          where: {
            id: movieID
          }
        });

        const found = await Showtimes.findOne({
            where: {
                movie_id: movieID,
                theater_id: theaterID,
                date: date,
                start_time: start,
                end_time: end,
            },
        });

        if (found) {
            res.locals.toastMessage = {
                title: "Thất Bại",
                msg: "suất chiếu đã tồn tại. Hãy kiểm tra lại",
            };
            res.render("admin/shows/add");
        } 
        else 
        {
            // thời gian bắt đầu phải bé hơn kết thúc
            if (start > end) 
            {
                res.locals.toastMessage = {
                    title: "Thất Bại",
                    msg: "thời gian kết thúc phải lớn hơn thời gian bắt đầu",
                };
                res.render("admin/shows/add");
            } 
            
            // ngày chiếu phải lớn hơn hoặc bằng ngày hiện tại
            if( date < moment(moment()).format("YYYY-MM-DD") )
            {
                  res.locals.toastMessage = {
                      title: "Thất Bại",
                      msg: "Ngày chiếu phim phải lớn hơn hoặc bằng ngày hiện tại",
                  };
                  res.render("admin/shows/add");
            }

            // ngày chiếu phim phải lớn hơn hoặc bằng ngày ra mắt phim
            if( date < moment(movie.releaseDate).format("YYYY-MM-DD") )
            {
                  res.locals.toastMessage = {
                      title: "Thất Bại",
                      msg: "Ngày chiếu phim phải lớn hơn hoặc bằng ngày ra mắt phim",
                  };
                  res.render("admin/shows/add");
            }

            else 
            {
                //insert into Showtimes
                const newShowtimes = await Showtimes.create({
                    start_time: start,
                    end_time: end,
                    date: date,
                    movie_id: movieID,
                    theater_id: theaterID,
                    price: price,
                });

                //check schedule existed
                const schedule = await Movies_schedule.findAll({
                    where: {
                        [Op.and]: [
                            { movie_id: movieID },
                            { theater_cluster_id: clusterID },
                            { schedule_date: date },
                        ],
                    },
                });

                if (newShowtimes.length !== 0 && schedule.length === 0) {
                    //insert into movies_schedules
                    const newSchedule = await Movies_schedule.create({
                        movie_id: movieID,
                        theater_cluster_id: clusterID,
                        schedule_date: date,
                    });
                }

                if (newShowtimes)
                {
                    req.session.toastMessage = {
                        title: "Thành Công",
                        msg: "Thêm suất chiếu thành công!",
                    };
                    res.redirect("/admin/shows");
                } 
                else 
                {
                    res.locals.toastMessage = {
                        title: "Thất Bại",
                        msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!",
                    };
                    res.render("admin/shows/add");
                }
            }
        }
    } 
    catch (e) 
    {
        res.locals.toastMessage = {
            title: "Thất Bại",
            msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!",
        };
        res.render("admin/shows/add");
    }
};

// FILTER THEATER
exports.filterTheater = async (req, res) => {
    const lstResult = await Theater.findAll({
        attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
        where: {
            theater_cluster_id: req.body.cluster,
        },
    });
    return res.status(200).json(lstResult);
};

//GET DETAIL
exports.getDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updateShowtime = await Showtimes.findByPk(id);
        if (!updateShowtime) throw new Error("Suất chiếu không tồn tại !");

        res.locals.Showtimes = updateShowtime;
        res.render("admin/shows/detail");
    } catch (e) {
        res.redirect("/admin/shows");
    }
};

//POST DETAIL
exports.postDetail = async (req, res, next) => {
    try {
        const { date, start, end, price, movieID, theaterID } = req.body;

        const updateShowtime = await Showtimes.findByPk(id);
        if (!updateShowtime) throw new Error("Suất chiếu không tồn tại !");

        updateShowtime.start_time = start;
        updateShowtime.end_time = end;
        updateShowtime.movie_id = movieID;
        updateShowtime.theater_id = theaterID;
        updateShowtime.date = date;
        updateShowtime.price = price;
        await updateShowtime.save();
        req.session.toastMessage = {
            title: "Thành Công",
            msg: "Cập nhật suất chiếu thành công!",
        };
        res.redirect("/admin/shows");
    } catch (e) {
        res.locals.toastMessage = {
            title: "Thất Bại",
            msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!",
        };
        res.locals.Showtime = await Showtimes.findByPk(req.body.id);
        res.render("admin/shows/detail");
    }
};

//DELETE
exports.getDelete = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleteShowtime = await Showtimes.findByPk(id);
        if (!deleteShowtime) throw new Error("Suất chiếu không tồn tại !");

        await deleteShowtime.destroy();
        req.session.toastMessage = {
            title: "Thành Công",
            msg: "Xóa suất chiếu thành công!",
        };
    } catch (e) {
        res.session.toastMessage = {
            title: "Thất Bại",
            msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!",
        };
    } finally {
        res.redirect("/admin/shows");
    }
};
