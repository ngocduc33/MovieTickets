const router = require("express").Router();
const homeController = require("../controllers/home");

router.get("/", homeController.getIndex);

//statistic theater cluster
router.post("/statistic/theater-cluster", homeController.postStatisticCluster);

//statistic movies
router.post("/statistic/movies", homeController.postStatisticMovies);

module.exports = router;
