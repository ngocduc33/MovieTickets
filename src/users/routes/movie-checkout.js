const router = require('express').Router();
const movieCheckoutController = require('../controllers/movie-checkout');

router.use((req, res, next) => {
  res.locals.layout = "users/layouts/layout";
  next();
});

router.get("/movie-checkout", movieCheckoutController.getCheckout);
router.post("/movie-checkout", movieCheckoutController.postCheckout);

module.exports = router;
