const movieListController = require('../controllers/movie-list');
var router = require("express").Router();

// lấy danh sách tất cả phim
router.get("/movie-list", movieListController.listMovies);

// phân trang tất cả các phim
router.get("/movie-list/:page", movieListController.Pagination);

// phân trang theo nội dung lọc
router.get("/movie-list/:sort/:page", movieListController.PaginationSort);

module.exports = router;
