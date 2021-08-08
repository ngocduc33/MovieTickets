const asyncHandler = require("express-async-handler");
const Theater_clusters = require("../../models/theater_clusters");
const Theater = require("../../models/theater");
const Cluster_images = require('../../models/cluster_images');
const db = require('../../config/database/db');

exports.getClusterDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cluster = await Theater_clusters.findByPk(id);

    //cluster.picture = Buffer.from(cluster.picture, "binary").toString("base64");

    const clusterImages = await Cluster_images.findAll({
        where: {
            cluster_id: id
        }
    });

    const lstClusterImg = [];

    clusterImages.forEach(e => {
        let image = Buffer.from(e.image, "binary").toString("base64");
        lstClusterImg.push(image);
    });

    const theaterList = await Theater.findAll({
        attributes: [[db.fn('DISTINCT', db.col('name')), 'name'], 'id', 'horizontial_size', 'vertical_size'],
        where: {
            theater_cluster_id: cluster.id
        }
    })

    if(theaterList.length !== 0)
    {     
        res.render("users/cluster-detail", { cluster, lstClusterImg , theaterList });
    }
    else
    {
        res.render("users/cluster-detail", { cluster, lstClusterImg , theaterList: null });
    }
});