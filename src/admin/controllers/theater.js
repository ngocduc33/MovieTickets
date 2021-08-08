const Theater = require('../../models/theater');
const TheaterCluster = require('../../models/theater_clusters');
const db = require("../../config/database/db");

//INDEX
exports.getIndex = async (req, res, next) => {
    if(req.session.user_role == true) {
        const theaterList = await Theater.findAll({
            include: [{
                model: TheaterCluster,
                attributes: ['name']
            }],
        });
        res.locals.TheaterList = theaterList;
        res.locals.lstTheaterCluster = await TheaterCluster.findAll({
            attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
          });
        res.render("admin/theater/index");
    }
    else {
        res.redirect("/user");
    }
};
exports.getAdd = async (req, res, next) => {
    if(req.session.user_role == true) {
        
        res.locals.lstTheaterCluster = await TheaterCluster.findAll({
            attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
          });
        res.render("admin/theater/add");
    }
    else {
        res.redirect("/user");
    }
}

exports.postAdd = async (req, res, next) => {
    try {
        const { name,theater_cluster_ID,kind,horizontial_size,vertical_size} = req.body;

        const found = await Theater.findOne({
            where: {
                name: name
            }
        });
        if(found) throw new Error('Rạp đã tồn tại !');

        //else
        await Theater.create({
            theater_cluster_id:theater_cluster_ID,
            name: name,
            kind:kind,
            horizontial_size:horizontial_size,
            vertical_size:vertical_size
        });
        req.session.toastMessage = { title: "Thành Công", msg: "Thêm rạp thành công!" };
        res.redirect('/admin/theater');         
        
    } catch(e) {
        res.locals.toastMessage = { title: "Thất Bại", msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!" }; 
        res.render("admin/theater/add");      
    } 
}

//DETAIL
exports.getDetail = async (req, res, next) => {
    if(req.session.user_role == true) {
        try {
            res.locals.lstTheaterCluster = await TheaterCluster.findAll({
                attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
              });
            const { id } = req.params;

            const updateTheater = await Theater.findByPk(id);
            if(!updateTheater) throw new Error('Rạp không tồn tại !');

            res.locals.Theater = updateTheater;
            res.render("admin/theater/detail");
        } catch(e) {
            res.redirect("/admin/theater");
        }
    }
    else {
        res.redirect("/user");
    }
}

exports.postDetail = async (req, res, next) => {
    try {
        res.locals.lstTheaterCluster = await TheaterCluster.findAll({
            attributes: [[db.fn("DISTINCT", db.col("name")), "name"], "id"],
          });
        const { id,name, theater_cluster_ID,kind,horizontial_size,vertical_size } = req.body;

        const updateTheater = await Theater.findByPk(id);
        if(!updateTheater) throw new Error('Rạp không tồn tại !');

        updateTheater.theater_cluster_id = theater_cluster_ID;
        updateTheater.name = name;
        updateTheater.kind = kind;
        updateTheater.horizontial_size=horizontial_size;
        updateTheater.vertical_size=vertical_size;
        await updateTheater.save();
        req.session.toastMessage = { title: "Thành Công", msg: "Cập nhật rạp thành công!" };
        res.redirect('/admin/theater'); 
    } catch (e) {
        res.locals.toastMessage = { title: "Thất Bại", msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!" };
        res.locals.Theater = await Theater.findByPk(req.body.id);
        res.render("admin/theater/detail");
    }
}


//DELETE
exports.getDelete = async (req, res, next) => {
    if(req.session.user_role == true) {
        try {
            const { id } = req.params;

            const deleteTheater = await Theater.findByPk(id);
            if(!deleteTheater) throw new Error('Rạp không tồn tại !');

            await deleteTheater.destroy();
            req.session.toastMessage = { title: "Thành Công", msg: "Xóa rạp thành công!" };
        } catch (e) {
            res.session.toastMessage = { title: "Thất Bại", msg: "Đã có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!" };
        } finally {
            res.redirect("/admin/theater");
        } 
    }
    else {
        res.redirect("/user");
    }
}