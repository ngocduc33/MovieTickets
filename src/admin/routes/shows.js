const router = require("express").Router();
const ShowsController = require('../controllers/shows');

//INDEX
router.get("/shows", ShowsController.getIndex);

//ADD
router.get("/shows/add", ShowsController.getAdd);
router.post("/shows/add", ShowsController.postAdd);

//FILTER THEATER
router.post("/shows/add/filter-theater", ShowsController.filterTheater);

// DETAIL
router.get("/shows/detail/:id", ShowsController.getDetail);
router.post("/shows/detail/:id",ShowsController.postDetail);

router.get("/shows/delete/:id", ShowsController.getDelete);
module.exports = router;