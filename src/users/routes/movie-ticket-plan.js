var router = require("express").Router();
const movieTicketPlanController = require('../controllers/movie-ticket-plan');

router.get("/movie-ticket-plan", movieTicketPlanController.getShowTimes);
router.post("/movie-ticket-plan", movieTicketPlanController.postShowTimes);
router.post("/movie-ticket-plan/search-showtimes", movieTicketPlanController.ajaxSearchShowtimes);
router.post("/movie-ticket-plan/filter-cluster", movieTicketPlanController.filterCluster);
router.post("/movie-ticket-plan/filter-date", movieTicketPlanController.filterDate);

module.exports = router;
