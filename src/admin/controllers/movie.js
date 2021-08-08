const Booking = require("../../models/booking");
const Movie = require("../../models/movie");
const Showtimes = require("../../models/showtimes");
const Ticket = require("../../models/ticket");
const db = require("../../config/database/db");
const moment = require("moment");

//INDEX
exports.getIndex = async (req, res, next) => {
     if(req.session.user_role == true) {
        const movieList = await Movie.findAll({
            order: [["id", "ASC"]],
        });
    
        movieList.forEach((e) => {
            e.poster = Buffer.from(e.poster, "binary").toString("base64");
        });

        res.render("admin/movie/index", {
            movieList,
        });
    }
    else
    {
        res.redirect("/user");
    }
};

// UPLOAD
var file = null;

exports.postUpload = async (req, res, next) => {
    res.send("success");
    file = req.file;
};

//ADD
exports.getAdd = (req, res, next) => {
    if (req.session.user_role == true) {
        res.render("admin/movie/add");
    } else {
        res.redirect("/user");
    }
};

exports.postAdd = async (req, res, next) => {
    try {
        const { name, releaseDate, duration, trailer} = req.body;

        //initial viewed
        const viewed = 0;

        //initial liked
        const liked = 0;

        const poster = file.buffer;

        const found = await Movie.findOne({
            where: {
                name,
            },
        });
        if (found)
        {
            res.locals.toastMessage = {
                title: "Thất Bại",
                msg: "Phim đã tồn tại",
            };
            res.render("admin/movie/add");
        }
        else
        {
            if(releaseDate < moment(moment()).format("YYYY-MM-DD"))
            {
                res.locals.toastMessage = {
                    title: "Thất Bại",
                    msg: "Ngày ra mắt phải lớn hơn ngày hiện tại",
                };
                res.render("admin/movie/add");
            }
            else
            {
                const result = await Movie.create({
                    name,
                    releaseDate,
                    poster,
                    duration,
                    trailer,
                    viewed,
                    liked,
                });
                if(result)
                {
                    req.session.toastMessage = {
                        title: "Thành Công",
                        msg: "Thêm phim thành công!",
                    };
                    res.redirect("/admin/movie");
                }
                else
                {
                    res.locals.toastMessage = {
                        title: "Thất Bại",
                        msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!",
                    };
                    res.render("admin/movie/add");
                }
            }
        }
        
    } catch (e) {
        console.log(e);
        res.locals.toastMessage = {
            title: "Thất Bại",
            msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!",
        };
        res.render("admin/movie/add");
    }
};

//DETAIL
exports.getDetail = async (req, res, next) => {
    if (req.session.user_role == true) {
        try {
            const { id } = req.params;

            const updateMovie = await Movie.findByPk(id);
            if (!updateMovie) throw new Error("Phim không tồn tại !");

            res.locals.Movie = updateMovie;
            res.render("admin/movie/detail");
        } catch (e) {
            res.redirect("/admin/movie");
        }
    } else {
        res.redirect("/user");
    }
};

exports.postDetail = async (req, res, next) => {
    try {
        const { id, name, releaseDate, duration, trailer, viewed, liked } =
            req.body;

        const updateMovie = await Movie.findByPk(id);
        if (!updateMovie) throw new Error("Phim không tồn tại !");

        updateMovie.name = name;
        updateMovie.releaseDate = releaseDate;
        updateMovie.poster = poster;
        updateMovie.duration = duration;
        updateMovie.trailer = trailer;
        updateMovie.viewed = viewed;
        updateMovie.liked = liked;
        await updateMovie.save();
        req.session.toastMessage = {
            title: "Thành Công",
            msg: "Cập nhật phim thành công!",
        };
        res.redirect("/admin/movie");
    } catch (e) {
        res.locals.toastMessage = {
            title: "Thất Bại",
            msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!",
        };
        res.locals.Movie = await Movie.findByPk(req.body.id);
        res.render("admin/movie/detail");
    }
};

//DELETE
exports.getDelete = async (req, res, next) => {
    if (req.session.user_role == true) {
        try {
            const { id } = req.params;

            const deleteMovie = await Movie.findByPk(id);
            if (!deleteMovie) throw new Error("Phim không tồn tại !");

            await deleteMovie.destroy();
            req.session.toastMessage = {
                title: "Thành Công",
                msg: "Xóa phim thành công!",
            };
        } catch (e) {
            req.session.toastMessage = {
                title: "Thất Bại",
                msg: "Không thể xoá do bộ phim đã được lưu vào dữ liệu!",
            };
        } finally {
            res.redirect("/admin/movie");
        }
    } else {
        res.redirect("/user");
    }
};
