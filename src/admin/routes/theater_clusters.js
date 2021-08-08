const router = require('express').Router();
const theaterClustersController = require('../controllers/theater_clusters');
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// INDEX
router.get("/theater-clusters", theaterClustersController.getIndex);

// ADD
router.get("/theater-clusters/add", theaterClustersController.getAdd);
router.post("/theater-clusters/add", theaterClustersController.postAdd);

// UPLOAD
router.post("/theater-clusters/upload", upload.array('file', 12), theaterClustersController.postUpload);

// DETAIL
router.get("/theater-clusters/detail/:id", theaterClustersController.getDetail);
router.post("/theater-clusters/detail/:id", theaterClustersController.postDetail);

router.get("/theater-clusters/delete/:id", theaterClustersController.getDelete);

module.exports = router;