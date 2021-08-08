const router = require("express").Router();
const TheaterController = require('../controllers/theater');

//INDEX
router.get("/theater", TheaterController.getIndex);

//ADD
router.get("/theater/add", TheaterController.getAdd);
router.post("/theater/add", TheaterController.postAdd);

// DETAIL
router.get("/theater/detail/:id", TheaterController.getDetail);
router.post("/theater/detail/:id", TheaterController.postDetail);

router.get("/theater/delete/:id", TheaterController.getDelete);
module.exports = router;

