const router = require('express').Router();
const movieSeatPlanController = require('../controllers/movie-seat-plan');

router.use((req, res, next) => {
  res.locals.layout = "users/layouts/layout";
  next();
});

router.get("/movie-seat-plan/:showtimeId", movieSeatPlanController.getSeat);
router.post("/movie-seat-plan/:showtimeId", movieSeatPlanController.postSeat)

module.exports = router;
