const router = require("express").Router();
const movieController = require('../controllers/movie');
const multer  = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

//INDEX
router.get("/movie",movieController.getIndex);

// ADD
router.get("/movie/add", movieController.getAdd);
router.post("/movie/add", movieController.postAdd);

// UPLOAD
router.post("/movie/upload", upload.single('file'), movieController.postUpload);

// DETAIL
router.get("/movie/detail/:id", movieController.getDetail);
router.post("/movie/detail/:id", movieController.postDetail);

router.get("/movie/delete/:id", movieController.getDelete);


module.exports = router;