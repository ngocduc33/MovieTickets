const router = require('express').Router();
const movieBookingSuccessController = require('../controllers/movie-booking-success');

router.use((req, res, next) => {
  res.locals.layout = "users/layouts/layout";
  next();
});

router.get("/booking/success/:booking_id", movieBookingSuccessController.getBookingSuccess);

module.exports = router;
