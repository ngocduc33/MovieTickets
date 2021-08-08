const router = require("express").Router();
const clusterController = require("../controllers/cluster-list");

router.get("/cluster-list", clusterController.getListCluster);

module.exports = router;
