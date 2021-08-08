const router = require("express").Router();
const clusterDetailController = require("../controllers/cluster-detail");

router.get("/cluster-detail/:id", clusterDetailController.getClusterDetail);

module.exports = router;
