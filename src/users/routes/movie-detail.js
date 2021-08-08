var router = require("express").Router();
const movieDetailController = require('../controllers/movie-detail');

router.get("/movie-detail/:id", movieDetailController.getMovieDetail);

module.exports = router;