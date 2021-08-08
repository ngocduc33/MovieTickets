const asyncHandler = require("express-async-handler");
const Theater_clusters = require("../../models/theater_clusters");

exports.getListCluster = asyncHandler(async (req, res) => {
    const lstCluster = await Theater_clusters.findAll({order: [['id', 'ASC']]});

    if(lstCluster.length !== 0)
    {
        lstCluster.forEach(cluster => {
            cluster.picture = Buffer.from(cluster.picture, "binary").toString("base64");
        });
    
        res.render("users/cluster-list", {lstCluster});
    }
    else
    {
        res.render("users/cluster-list", {lstCluster: null});
    }
});
