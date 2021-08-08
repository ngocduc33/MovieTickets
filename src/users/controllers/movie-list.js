const asyncHandler = require("express-async-handler");
const db = require("../../config/database/db");
const Movies = require("../../models/movie");

//lấy tất cả các phim
exports.listMovies = asyncHandler(async (req, res) => {
    //lấy yêu cầu lọc phim
    let sort = req.query?.sort;

    let page = 1;
    let size = 6;

    //hiển thị danh sách phim theo ngày ra mắt
    if (typeof sort !== 'undefined' && sort === "releaseDate") 
    {
        const movies = await Movies.findAll({
            offset: page * size - size,
            limit: size,
            order: [['releaseDate', 'DESC']],
        });

        const countMovies = await Movies.findAndCountAll();

        movies.forEach((movie) => {
            if (movie.poster) {
                movie.poster = Buffer.from(movie.poster, "binary").toString(
                    "base64"
                );
            }
        });

        res.render("users/movie-list", {
            movies,
            current: page,
            sort,
            totalPage: Math.ceil(countMovies.count / size),
        });
    }

    //hiển thị danh sách phim theo lượt xem
    if (typeof sort !== 'undefined' && sort === "mostViewed") {
        const movies = await Movies.findAll({
            offset: page * size - size,
            limit: size,
            order: [["viewed", "DESC"]],
        });

        const countMovies = await Movies.findAndCountAll();

        movies.forEach((movie) => {
            if (movie.poster) {
                movie.poster = Buffer.from(movie.poster, "binary").toString(
                    "base64"
                );
            }
        });

        res.render("users/movie-list", {
            movies,
            current: page,
            sort,
            totalPage: Math.ceil(countMovies.count / size),
        });
    }

    //hiển thị danh sách phim theo lượt yêu thích
    if (typeof sort !== 'undefined' && sort === "mostLiked") 
    {
        const movies = await Movies.findAll({
            offset: page * size - size,
            limit: size,
            order: [["liked", "DESC"]],
        });

        const countMovies = await Movies.findAndCountAll();

        movies.forEach((movie) => {
            if (movie.poster) {
                movie.poster = Buffer.from(movie.poster, "binary").toString(
                    "base64"
                );
            }
        });

        res.render("users/movie-list", {
            movies,
            current: page,
            sort,
            totalPage: Math.ceil(countMovies.count / size),
        });
    }
    if(typeof sort === 'undefined')
    {
        const movies = await Movies.findAll({
            limit: size,
            offset: page * size - size,
        });
    
        const countMovies = await Movies.findAndCountAll();
    
        movies.forEach((movie) => {
            if (movie.poster) {
                movie.poster = Buffer.from(movie.poster, "binary").toString(
                    "base64"
                );
            }
        });
    
        res.render("users/movie-list", {
            movies,
            current: page,
            sort: null,
            totalPage: Math.ceil(countMovies.count / size),
        });
    }
});

//phân trang
exports.Pagination = asyncHandler(async (req, res) => {
    //lấy số trang
    const pageAsNumber = Number.parseInt(req.params.page);

    let page = 1;
    let size = 6;

    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
        page = pageAsNumber;
    }

    const movies = await Movies.findAll({
        limit: size,
        offset: page * size - size,
    });

    const countMovies = await Movies.findAndCountAll();

    movies.forEach((movie) => {
        if (movie.poster) {
            movie.poster = Buffer.from(movie.poster, "binary").toString(
                "base64"
            );
        }
    });

    res.render("users/movie-list", {
        movies,
        current: page,
        sort: null,
        totalPage: Math.ceil(countMovies.count / size),
    });
});

// phân trang với các bộ phim được lọc theo yêu cầu
exports.PaginationSort = asyncHandler(async (req, res) => {
    //lấy số trang
    const pageAsNumber = Number.parseInt(req.params.page);

    //lấy nội dung lọc
    const sort = req.params?.sort;

    let page = 1;
    let size = 6;

    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
        page = pageAsNumber;
    }

    if(typeof sort !== 'undefined' && sort === 'releaseDate')
    {
        const movies = await Movies.findAll({
            offset: page * size - size,
            limit: size,
            order: [["releaseDate", "DESC"]],
        });

        const countMovies = await Movies.findAndCountAll();

        movies.forEach((movie) => {
            if (movie.poster) {
                movie.poster = Buffer.from(movie.poster, "binary").toString(
                    "base64"
                );
            }
        });

        res.render("users/movie-list", {
            movies,
            current: page,
            sort,
            totalPage: Math.ceil(countMovies.count / size),
        });
    }
    if(typeof sort !== 'undefined' && sort === 'mostViewed')
    {
        const movies = await Movies.findAll({
            offset: page * size - size,
            limit: size,
            order: [["viewed", "DESC"]],
        });

        const countMovies = await Movies.findAndCountAll();

        movies.forEach((movie) => {
            if (movie.poster) {
                movie.poster = Buffer.from(movie.poster, "binary").toString(
                    "base64"
                );
            }
        });

        res.render("users/movie-list", {
            movies,
            current: page,
            sort,
            totalPage: Math.ceil(countMovies.count / size),
        });
    }
    if(typeof sort !== 'undefined' && sort === "mostLiked")
    {
        const movies = await Movies.findAll({
            offset: page * size - size,
            limit: size,
            order: [["liked", "DESC"]],
        });

        const countMovies = await Movies.findAndCountAll();

        movies.forEach((movie) => {
            if (movie.poster) {
                movie.poster = Buffer.from(movie.poster, "binary").toString(
                    "base64"
                );
            }
        });

        res.render("users/movie-list", {
            movies,
            current: page,
            sort,
            totalPage: Math.ceil(countMovies.count / size),
        });
    }
});
